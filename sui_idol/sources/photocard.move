module sui_idol::photocard {
    use std::string::{Self, String};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::table::{Self, Table};

    // 포토카드 구조체
    struct PhotoCard has key, store {
        id: UID,
        idol_id: u64,
        idol_name: String,
        rarity: String, // "N", "R", "SR", "SSR"
        concept: String,
        season: String,
        serial_no: u64,
        total_supply: u64,
        image_url: String,
        persona_prompt: String,
        minted_at: u64,
        owner: address,
    }

    // 아이돌 카드 구조체
    struct IdolCard has key, store {
        id: UID,
        idol_id: u64,
        name: String,
        personality: String,
        image_url: String,
        persona_prompt: String,
        minted_at: u64,
        owner: address,
    }

    // 민팅 이벤트
    struct PhotoCardMinted has copy, drop {
        idol_id: u64,
        idol_name: String,
        rarity: String,
        serial_no: u64,
        owner: address,
    }

    struct IdolCardMinted has copy, drop {
        idol_id: u64,
        name: String,
        owner: address,
    }

    // 크로스 체인 전송 이벤트
    struct CrossChainTransferInitiated has copy, drop {
        token_address: address,
        amount: u64,
        target_chain: String,
        recipient: String,
        timestamp: u64,
        sender: address,
    }

    // 랜덤박스 구조체
    struct RandomBox has key, store {
        id: UID,
        box_type: String, // "daily", "premium", "legendary"
        price: u64,
        max_claims_per_day: u64,
        pity_threshold: u64,
    }

    // 랜덤박스 오픈 이벤트
    struct RandomBoxOpened has copy, drop {
        box_id: ID,
        box_type: String,
        rarity: String,
        photocard_id: ID,
        owner: address,
        timestamp: u64,
    }

    // 마켓플레이스 리스팅 구조체
    struct MarketplaceListing has key, store {
        id: UID,
        photocard_id: ID,
        seller: address,
        price: u64,
        listing_type: String, // "sale", "auction"
        auction_end_time: u64,
        highest_bidder: address,
        highest_bid: u64,
        is_active: bool,
        created_at: u64,
    }

    // 거래 이벤트
    struct PhotoCardSold has copy, drop {
        photocard_id: ID,
        seller: address,
        buyer: address,
        price: u64,
        timestamp: u64,
    }

    struct PhotoCardListed has copy, drop {
        photocard_id: ID,
        seller: address,
        price: u64,
        listing_type: String,
        timestamp: u64,
    }

    // 사용자 통계 구조체
    struct UserStats has key, store {
        id: UID,
        user: address,
        total_photocards: u64,
        total_spent: u64,
        total_earned: u64,
        daily_claims: u64,
        last_claim_time: u64,
        pity_counters: Table<String, u64>,
    }

    // 글로벌 상태 구조체
    struct GlobalState has key {
        id: UID,
        total_photocards_minted: u64,
        total_boxes_opened: u64,
        total_volume_traded: u64,
        active_listings: u64,
        user_stats: Table<address, ID>,
        daily_claim_tracker: Table<address, u64>,
    }

    // 포토카드 민팅 함수
    public fun mint_photocard(
        idol_id: u64,
        idol_name: String,
        rarity: String,
        concept: String,
        season: String,
        serial_no: u64,
        total_supply: u64,
        image_url: String,
        persona_prompt: String,
        ctx: &mut TxContext
    ) {
        let photocard = PhotoCard {
            id: object::new(ctx),
            idol_id,
            idol_name,
            rarity,
            concept,
            season,
            serial_no,
            total_supply,
            image_url,
            persona_prompt,
            minted_at: tx_context::epoch_timestamp_ms(ctx),
            owner: tx_context::sender(ctx),
        };

        // 민팅 이벤트 발생
        event::emit(PhotoCardMinted {
            idol_id,
            idol_name,
            rarity,
            serial_no,
            owner: tx_context::sender(ctx),
        });

        // 포토카드를 전송자에게 전송
        transfer::public_transfer(photocard, tx_context::sender(ctx));
    }

    // 아이돌 카드 민팅 함수
    public fun mint_idol_card(
        idol_id: u64,
        name: String,
        personality: String,
        image_url: String,
        persona_prompt: String,
        ctx: &mut TxContext
    ) {
        let idol_card = IdolCard {
            id: object::new(ctx),
            idol_id,
            name,
            personality,
            image_url,
            persona_prompt,
            minted_at: tx_context::epoch_timestamp_ms(ctx),
            owner: tx_context::sender(ctx),
        };

        // 민팅 이벤트 발생
        event::emit(IdolCardMinted {
            idol_id,
            name,
            owner: tx_context::sender(ctx),
        });

        // 아이돌 카드를 전송자에게 전송
        transfer::public_transfer(idol_card, tx_context::sender(ctx));
    }

    // 포토카드 전송 함수
    public fun transfer_photocard(photocard: PhotoCard, recipient: address) {
        transfer::transfer(photocard, recipient);
    }

    // 아이돌 카드 전송 함수
    public fun transfer_idol_card(idol_card: IdolCard, recipient: address) {
        transfer::transfer(idol_card, recipient);
    }

    // 포토카드 정보 조회 함수
    public fun get_photocard_info(photocard: &PhotoCard): (u64, String, String, String, u64) {
        (photocard.idol_id, photocard.idol_name, photocard.rarity, photocard.concept, photocard.serial_no)
    }

    // 아이돌 카드 정보 조회 함수
    public fun get_idol_card_info(idol_card: &IdolCard): (u64, String, String) {
        (idol_card.idol_id, idol_card.name, idol_card.personality)
    }

    // 포토카드 소유자 확인 함수
    public fun get_photocard_owner(photocard: &PhotoCard): address {
        photocard.owner
    }

    // 아이돌 카드 소유자 확인 함수
    public fun get_idol_card_owner(idol_card: &IdolCard): address {
        idol_card.owner
    }

    // 크로스 체인 전송 함수
    public fun cross_chain_transfer(
        token_address: address,
        amount: u64,
        target_chain: String,
        recipient: String,
        timestamp: u64,
        ctx: &mut TxContext
    ) {
        // 크로스 체인 전송 이벤트 발생
        event::emit(CrossChainTransferInitiated {
            token_address,
            amount,
            target_chain,
            recipient,
            timestamp,
            sender: tx_context::sender(ctx),
        });
    }

    // 글로벌 상태 초기화 함수
    public fun init_global_state(ctx: &mut TxContext) {
        let global_state = GlobalState {
            id: object::new(ctx),
            total_photocards_minted: 0,
            total_boxes_opened: 0,
            total_volume_traded: 0,
            active_listings: 0,
            user_stats: table::new(ctx),
            daily_claim_tracker: table::new(ctx),
        };
        transfer::share_object(global_state);
    }

    // 랜덤박스 생성 함수
    public fun create_random_box(
        box_type: String,
        price: u64,
        max_claims_per_day: u64,
        pity_threshold: u64,
        ctx: &mut TxContext
    ) {
        let random_box = RandomBox {
            id: object::new(ctx),
            box_type,
            price,
            max_claims_per_day,
            pity_threshold,
        };
        transfer::public_transfer(random_box, tx_context::sender(ctx));
    }

    // 랜덤박스 오픈 함수
    public fun open_random_box(
        random_box: RandomBox,
        global_state: &mut GlobalState,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = tx_context::epoch_timestamp_ms(ctx);
        let box_price = random_box.price;
        let box_type = random_box.box_type;
        let pity_threshold = random_box.pity_threshold;
        let box_id = object::uid_to_inner(&random_box.id);
        
        // 일일 클레임 확인
        let daily_claims = if (table::contains(&global_state.daily_claim_tracker, sender)) {
            table::borrow_mut(&mut global_state.daily_claim_tracker, sender)
        } else {
            table::add(&mut global_state.daily_claim_tracker, sender, 0);
            table::borrow_mut(&mut global_state.daily_claim_tracker, sender)
        };
        assert!(*daily_claims < random_box.max_claims_per_day, 0);
        
        // 결제 확인
        assert!(coin::value(&payment) >= box_price, 1);
        
        // 통계 업데이트
        global_state.total_boxes_opened = global_state.total_boxes_opened + 1;
        *daily_claims = *daily_claims + 1;
        
        // 랜덤 레어도 결정 (피티 시스템 포함)
        let rarity = determine_rarity(pity_threshold, global_state);
        
        // 포토카드 민팅
        let photocard_id = mint_random_photocard(rarity, sender, ctx);
        
        // 이벤트 발생
        event::emit(RandomBoxOpened {
            box_id,
            box_type,
            rarity,
            photocard_id,
            owner: sender,
            timestamp: current_time,
        });
        
        // 랜덤박스 소각
        let RandomBox { id, box_type: _, price: _, max_claims_per_day: _, pity_threshold: _ } = random_box;
        object::delete(id);
        
        // 결제 처리
        let treasury = coin::split(&mut payment, box_price, ctx);
        transfer::public_transfer(treasury, @sui_idol);
        
        // 남은 결제 금액 반환
        transfer::public_transfer(payment, sender);
    }

    // 마켓플레이스 리스팅 생성 함수
    public fun create_listing(
        photocard: PhotoCard,
        price: u64,
        listing_type: String,
        auction_end_time: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let photocard_id = object::uid_to_inner(&photocard.id);
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        let listing = MarketplaceListing {
            id: object::new(ctx),
            photocard_id,
            seller: sender,
            price,
            listing_type,
            auction_end_time,
            highest_bidder: @0x0,
            highest_bid: 0,
            is_active: true,
            created_at: timestamp,
        };
        
        // 리스팅 이벤트 발생
        event::emit(PhotoCardListed {
            photocard_id,
            seller: sender,
            price,
            listing_type,
            timestamp,
        });
        
        // 포토카드를 컨트랙트로 전송
        transfer::public_transfer(photocard, sender);
        
        transfer::public_transfer(listing, sender);
    }

    // 포토카드 구매 함수
    public fun buy_photocard(
        listing: MarketplaceListing,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let buyer = tx_context::sender(ctx);
        let listing_price = listing.price;
        let seller = listing.seller;
        let photocard_id = listing.photocard_id;
        let timestamp = tx_context::epoch_timestamp_ms(ctx);
        
        assert!(listing.is_active, 2);
        assert!(coin::value(&payment) >= listing_price, 3);
        
        // 결제 처리
        let seller_payment = coin::split(&mut payment, listing_price, ctx);
        transfer::public_transfer(seller_payment, seller);
        
        // 거래 이벤트 발생
        event::emit(PhotoCardSold {
            photocard_id,
            seller,
            buyer,
            price: listing_price,
            timestamp,
        });
        
        // 리스팅 비활성화
        let MarketplaceListing { id, photocard_id: _, seller: _, price: _, listing_type: _, auction_end_time: _, highest_bidder: _, highest_bid: _, is_active: _, created_at: _ } = listing;
        object::delete(id);
        
        // 남은 결제 금액 반환
        transfer::public_transfer(payment, buyer);
    }

    // 레어도 결정 함수 (내부)
    fun determine_rarity(_pity_threshold: u64, global_state: &GlobalState): String {
        // 간단한 랜덤 로직 (실제로는 더 복잡한 알고리즘 사용)
        let _random_value = global_state.total_boxes_opened % 100;
        
        if (_random_value < 1) {
            string::utf8(b"SSR")
        } else if (_random_value < 5) {
            string::utf8(b"SR")
        } else if (_random_value < 20) {
            string::utf8(b"R")
        } else {
            string::utf8(b"N")
        }
    }

    // 랜덤 포토카드 민팅 함수 (내부)
    fun mint_random_photocard(rarity: String, owner: address, ctx: &mut TxContext): ID {
        // 실제 구현에서는 더 복잡한 로직 사용
        let photocard = PhotoCard {
            id: object::new(ctx),
            idol_id: 1,
            idol_name: string::utf8(b"Random Idol"),
            rarity,
            concept: string::utf8(b"Random Concept"),
            season: string::utf8(b"Random Season"),
            serial_no: 1,
            total_supply: 1000,
            image_url: string::utf8(b"https://example.com/image.jpg"),
            persona_prompt: string::utf8(b"Random persona"),
            minted_at: tx_context::epoch_timestamp_ms(ctx),
            owner,
        };
        
        let photocard_id = object::uid_to_inner(&photocard.id);
        transfer::public_transfer(photocard, owner);
        photocard_id
    }
}
