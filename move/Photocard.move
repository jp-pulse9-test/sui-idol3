module sui_idol::photocard {
    use std::string::String;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;

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
    ): PhotoCard {
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

        photocard
    }

    // 아이돌 카드 민팅 함수
    public fun mint_idol_card(
        idol_id: u64,
        name: String,
        personality: String,
        image_url: String,
        persona_prompt: String,
        ctx: &mut TxContext
    ): IdolCard {
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

        idol_card
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
}
