#[starknet::interface]
pub trait IBootcampNFT<TContractState> {
    fn mint(ref self: TContractState);
    fn has_minted(self: @TContractState, user: starknet::ContractAddress) -> bool;
    fn add_student(ref self: TContractState, student: starknet::ContractAddress);
    fn add_students(ref self: TContractState, students: Span<starknet::ContractAddress>);
    fn is_student_allowed(self: @TContractState, user: starknet::ContractAddress) -> bool;
}

#[starknet::contract]
pub mod BootcampNFT {
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_introspection::src5::SRC5Component;
    use openzeppelin_token::erc721::ERC721Component;
    
    // Internal Trait imports to enable component functions like .initializer() and .mint()
    use openzeppelin_access::ownable::OwnableComponent::InternalTrait as OwnableInternalTrait;
    use openzeppelin_token::erc721::ERC721Component::InternalTrait as ERC721InternalTrait;

    // OpenZeppelin 2.0.0+ Hooks
    use openzeppelin_token::erc721::ERC721HooksEmptyImpl;

    use starknet::storage::{Map, StoragePointerReadAccess, StoragePointerWriteAccess, StoragePathEntry};
    use starknet::{ContractAddress, get_caller_address};
    use core::num::traits::Zero;

    // 1. Declaración de Componentes
    component!(path: ERC721Component, storage: erc721, event: ERC721Event);
    component!(path: SRC5Component, storage: src5, event: SRC5Event);
    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    // 2. Exposición de funciones estándar (Mixin)
    #[abi(embed_v0)]
    impl ERC721MixinImpl = ERC721Component::ERC721MixinImpl<ContractState>;
    #[abi(embed_v0)]
    impl OwnableMixinImpl = OwnableComponent::OwnableMixinImpl<ContractState>;

    // 3. Implementaciones internas necesarias
    impl ERC721InternalImpl = ERC721Component::InternalImpl<ContractState>;
    impl OwnableInternalImpl = OwnableComponent::InternalImpl<ContractState>;
    impl ERC721HooksImpl = ERC721HooksEmptyImpl<ContractState>;

    #[storage]
    struct Storage {
        #[substorage(v0)]
        erc721: ERC721Component::Storage,
        #[substorage(v0)]
        src5: SRC5Component::Storage,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
        next_token_id: u256,
        minted_wallets: Map<ContractAddress, bool>, // Sybil Resistance
        is_allowed: Map<ContractAddress, bool> // Allowlist de estudiantes
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        #[flat]
        ERC721Event: ERC721Component::Event,
        #[flat]
        SRC5Event: SRC5Component::Event,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
        StudentAdded: StudentAdded,
    }

    #[derive(Drop, starknet::Event)]
    struct StudentAdded {
        student: ContractAddress,
    }


    #[constructor]
    fn constructor(ref self: ContractState, admin_address: ContractAddress) {
        // Inicializa el NFT con el Base URI apuntando a tu futuro dominio en Vercel
        // Reemplaza "tu-proyecto" por el nombre real que usarás.
        self.erc721.initializer("Starknet Bootcamp", "SBC", "https://tu-proyecto.vercel.app/api/nft/");
        self.ownable.initializer(admin_address);
        self.next_token_id.write(1);
    }

    #[abi(embed_v0)]
    impl BootcampNFTImpl of super::IBootcampNFT<ContractState> {
        // --- FUNCIONES DE ADMINISTRADOR ---

        fn add_student(ref self: ContractState, student: ContractAddress) {
            self.ownable.assert_only_owner(); // Solo el admin puede ejecutar
            assert(!student.is_zero(), 'Student is zero address');
            self.is_allowed.entry(student).write(true);
            self.emit(StudentAdded { student });
        }

        fn add_students(ref self: ContractState, mut students: Span<ContractAddress>) {
            self.ownable.assert_only_owner();

            for student in students {
                let student_addr = *student;
                assert(!student_addr.is_zero(), 'Student is zero address');
                // Optimización de gas: Solo escribe si no está registrado
                if !self.is_allowed.entry(student_addr).read() {
                    self.is_allowed.entry(student_addr).write(true);
                    self.emit(StudentAdded { student: student_addr });
                }
            }
        }

        // --- FUNCIONES DEL ESTUDIANTE ---

        fn mint(ref self: ContractState) {
            let caller = get_caller_address();
            assert(!caller.is_zero(), 'Caller is zero address');

            // Validación 1: ¿Está en la lista permitida?
            let is_in_allowlist = self.is_allowed.entry(caller).read();
            assert(is_in_allowlist, 'User not in allowlist');

            // Validación 2: ¿Ya minteó antes?
            let has_already_minted = self.minted_wallets.entry(caller).read();
            assert(!has_already_minted, 'Wallet already minted');

            let token_id = self.next_token_id.read();

            // Actualización de estado ANTES de interactuar (Checks-Effects-Interactions)
            self.minted_wallets.entry(caller).write(true);
            self.erc721.mint(caller, token_id);
            self.next_token_id.write(token_id + 1);
        }

        // --- FUNCIONES DE LECTURA (VIEW) ---

        fn has_minted(self: @ContractState, user: ContractAddress) -> bool {
            self.minted_wallets.entry(user).read()
        }

        fn is_student_allowed(self: @ContractState, user: ContractAddress) -> bool {
            self.is_allowed.entry(user).read()
        }
    }
}
