module sui_idol::photocard {
    use std::string::String;
    use sui::event;
    use sui::display::{Self, Display};
    use sui::package::{Self, Publisher};

    // One-Time-Witness for the module
    public struct PHOTOCARD has drop {}

    // 포토카드 구조체
    public struct PhotoCard has key, store {
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
    public struct IdolCard has key, store {
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
    public struct PhotoCardMinted has copy, drop {
        idol_id: u64,
        idol_name: String,
        rarity: String,
        serial_no: u64,
        owner: address,
    }

    public struct IdolCardMinted has copy, drop {
        idol_id: u64,
        name: String,
        owner: address,
    }

    /// 모듈 초기화 함수 - Publisher를 클레임하고 Display를 설정
    fun init(otw: PHOTOCARD, ctx: &mut TxContext) {
        // Publisher 클레임
        let publisher = package::claim(otw, ctx);

        // PhotoCard Display 설정
        let photocard_keys = vector[
            b"name".to_string(),
            b"description".to_string(),
            b"link".to_string(),
            b"image_url".to_string(),
            b"thumbnail_url".to_string(),
            b"project_url".to_string(),
            b"creator".to_string(),
            b"attributes".to_string(),
        ];

        let photocard_values = vector[
            // For `name` one can use the `PhotoCard.idol_name` property
            b"{idol_name} PhotoCard".to_string(),
            // For `description` one can build a description using properties
            b"K-pop Idol Photocard NFT - {concept} concept from {season} season".to_string(),
            // For `link` one can build a URL using an `id` property
            b"https://sui-idol.io/photocard/{id}".to_string(),
            // For `image_url` use the `image_url` property
            b"{image_url}".to_string(),
            // For `thumbnail_url` use the same image as thumbnail
            b"{image_url}".to_string(),
            // Project URL is usually static
            b"https://sui-idol.io".to_string(),
            // Creator field
            b"Sui Idol Team".to_string(),
            // Attributes field with all properties
            b"idol_id:{idol_id},rarity:{rarity},concept:{concept},season:{season},serial_no:{serial_no},total_supply:{total_supply}".to_string(),
        ];

        let mut pc_display = display::new_with_fields<PhotoCard>(
            &publisher, photocard_keys, photocard_values, ctx
        );
        pc_display.update_version();

        // IdolCard Display 설정
        let idolcard_keys = vector[
            b"name".to_string(),
            b"description".to_string(),
            b"link".to_string(),
            b"image_url".to_string(),
            b"thumbnail_url".to_string(),
            b"project_url".to_string(),
            b"creator".to_string(),
            b"attributes".to_string(),
        ];

        let idolcard_values = vector[
            // For `name` one can use the `IdolCard.name` property
            b"{name} Idol Card".to_string(),
            // For `description` one can build a description using properties
            b"K-pop Idol Character Card NFT - {personality} personality".to_string(),
            // For `link` one can build a URL using an `id` property
            b"https://sui-idol.io/idol/{id}".to_string(),
            // For `image_url` use the `image_url` property
            b"{image_url}".to_string(),
            // For `thumbnail_url` use the same image as thumbnail
            b"{image_url}".to_string(),
            // Project URL is usually static
            b"https://sui-idol.io".to_string(),
            // Creator field
            b"Sui Idol Team".to_string(),
            // Attributes field with properties
            b"idol_id:{idol_id},personality:{personality}".to_string(),
        ];

        let mut ic_display = display::new_with_fields<IdolCard>(
            &publisher, idolcard_keys, idolcard_values, ctx
        );
        ic_display.update_version();

        // Publisher와 Display 객체들을 전송자에게 전송
        transfer::public_transfer(publisher, ctx.sender());
        transfer::public_transfer(pc_display, ctx.sender());
        transfer::public_transfer(ic_display, ctx.sender());
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

    /// Display 업데이트 함수들
    /// PhotoCard Display 업데이트
    public fun update_photocard_display(
        display: &mut Display<PhotoCard>,
        _publisher: &Publisher,
        _ctx: &mut TxContext
    ) {
        let keys = vector[
            b"name".to_string(),
            b"description".to_string(),
            b"link".to_string(),
            b"image_url".to_string(),
            b"thumbnail_url".to_string(),
            b"project_url".to_string(),
            b"creator".to_string(),
            b"attributes".to_string(),
        ];

        let values = vector[
            b"{idol_name} PhotoCard".to_string(),
            b"K-pop Idol Photocard NFT - {concept} concept from {season} season".to_string(),
            b"https://sui-idol.io/photocard/{id}".to_string(),
            b"{image_url}".to_string(),
            b"{image_url}".to_string(),
            b"https://sui-idol.io".to_string(),
            b"Sui Idol Team".to_string(),
            b"idol_id:{idol_id},rarity:{rarity},concept:{concept},season:{season},serial_no:{serial_no},total_supply:{total_supply}".to_string(),
        ];

        display::add_multiple(display, keys, values);
        display.update_version();
    }

    /// IdolCard Display 업데이트
    public fun update_idolcard_display(
        display: &mut Display<IdolCard>,
        _publisher: &Publisher,
        _ctx: &mut TxContext
    ) {
        let keys = vector[
            b"name".to_string(),
            b"description".to_string(),
            b"link".to_string(),
            b"image_url".to_string(),
            b"thumbnail_url".to_string(),
            b"project_url".to_string(),
            b"creator".to_string(),
            b"attributes".to_string(),
        ];

        let values = vector[
            b"{name} Idol Card".to_string(),
            b"K-pop Idol Character Card NFT - {personality} personality".to_string(),
            b"https://sui-idol.io/idol/{id}".to_string(),
            b"{image_url}".to_string(),
            b"{image_url}".to_string(),
            b"https://sui-idol.io".to_string(),
            b"Sui Idol Team".to_string(),
            b"idol_id:{idol_id},personality:{personality}".to_string(),
        ];

        display::add_multiple(display, keys, values);
        display.update_version();
    }

    /// Display 필드 개별 수정 함수들
    public fun edit_photocard_display_field(
        display: &mut Display<PhotoCard>,
        key: String,
        value: String
    ) {
        display::edit(display, key, value);
        display.update_version();
    }

    public fun edit_idolcard_display_field(
        display: &mut Display<IdolCard>,
        key: String,
        value: String
    ) {
        display::edit(display, key, value);
        display.update_version();
    }

    /// Display 필드 제거 함수들
    public fun remove_photocard_display_field(
        display: &mut Display<PhotoCard>,
        key: String
    ) {
        display::remove(display, key);
        display.update_version();
    }

    public fun remove_idolcard_display_field(
        display: &mut Display<IdolCard>,
        key: String
    ) {
        display::remove(display, key);
        display.update_version();
    }
}
