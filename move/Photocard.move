module sui_idol::photocard {
    use std::string::String;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;
    use sui::display;

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

    // 아이돌 카드 Display 구조체
    struct IdolCardDisplay has key {
        id: UID,
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

    // 포토카드 Display 초기화 함수
    public fun init_photocard_display(ctx: &mut TxContext) {
        let display = PhotoCardDisplay {
            id: object::new(ctx),
        };
        
        let mut version = display::new_with_fields<PhotoCardDisplay>(
            b"PhotoCard",
            b"description", b"AI Generated Idol Photocard NFT",
            b"image_url", b"https://sui-idol.com/placeholder.png",
            b"link", b"https://sui-idol.com",
            b"name", b"PhotoCard",
            b"project_url", b"https://sui-idol.com",
        );
        
        display::update_version(&mut version);
        display::commit_version(version, display);
    }

    // 아이돌 카드 Display 초기화 함수
    public fun init_idol_card_display(ctx: &mut TxContext) {
        let display = IdolCardDisplay {
            id: object::new(ctx),
        };
        
        let mut version = display::new_with_fields<IdolCardDisplay>(
            b"IdolCard",
            b"description", b"AI Generated Idol Character NFT",
            b"image_url", b"https://sui-idol.com/placeholder.png",
            b"link", b"https://sui-idol.com",
            b"name", b"IdolCard",
            b"project_url", b"https://sui-idol.com",
        );
        
        display::update_version(&mut version);
        display::commit_version(version, display);
    }

    // 포토카드 Display 업데이트 함수
    public fun update_photocard_display(
        display: &mut PhotoCardDisplay,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        link: vector<u8>,
        project_url: vector<u8>,
    ) {
        let mut version = display::new_with_fields<PhotoCardDisplay>(
            name,
            b"description", description,
            b"image_url", image_url,
            b"link", link,
            b"name", name,
            b"project_url", project_url,
        );
        
        display::update_version(&mut version);
        display::commit_version(version, display);
    }

    // 아이돌 카드 Display 업데이트 함수
    public fun update_idol_card_display(
        display: &mut IdolCardDisplay,
        name: vector<u8>,
        description: vector<u8>,
        image_url: vector<u8>,
        link: vector<u8>,
        project_url: vector<u8>,
    ) {
        let mut version = display::new_with_fields<IdolCardDisplay>(
            name,
            b"description", description,
            b"image_url", image_url,
            b"link", link,
            b"name", name,
            b"project_url", project_url,
        );
        
        display::update_version(&mut version);
        display::commit_version(version, display);
    }

    // 포토카드 개별 Display 업데이트 함수
    public fun update_photocard_individual_display(
        display: &mut PhotoCardDisplay,
        photocard: &PhotoCard,
    ) {
        let name = std::string::bytes(&std::string::utf8(b"PhotoCard #"));
        let serial_str = std::string::utf8(b"");
        // serial_no를 string으로 변환하는 로직이 필요하지만, Move에서는 복잡하므로 간단히 처리
        let full_name = std::string::utf8(b"PhotoCard");
        
        let description = std::string::bytes(&std::string::utf8(b"AI Generated Idol Photocard - "));
        let rarity_desc = std::string::bytes(&photocard.rarity);
        let concept_desc = std::string::bytes(&photocard.concept);
        
        let image_url = std::string::bytes(&photocard.image_url);
        let link = std::string::bytes(&std::string::utf8(b"https://sui-idol.com/photocard/"));
        let project_url = std::string::bytes(&std::string::utf8(b"https://sui-idol.com"));
        
        let mut version = display::new_with_fields<PhotoCardDisplay>(
            std::string::bytes(&full_name),
            b"description", std::string::bytes(&std::string::utf8(b"AI Generated Idol Photocard")),
            b"image_url", image_url,
            b"link", link,
            b"name", std::string::bytes(&full_name),
            b"project_url", project_url,
            b"attributes", std::string::bytes(&std::string::utf8(b"")),
        );
        
        display::update_version(&mut version);
        display::commit_version(version, display);
    }

    // 아이돌 카드 개별 Display 업데이트 함수
    public fun update_idol_card_individual_display(
        display: &mut IdolCardDisplay,
        idol_card: &IdolCard,
    ) {
        let name = std::string::bytes(&idol_card.name);
        let description = std::string::bytes(&std::string::utf8(b"AI Generated Idol Character"));
        let image_url = std::string::bytes(&idol_card.image_url);
        let link = std::string::bytes(&std::string::utf8(b"https://sui-idol.com/idol/"));
        let project_url = std::string::bytes(&std::string::utf8(b"https://sui-idol.com"));
        
        let mut version = display::new_with_fields<IdolCardDisplay>(
            name,
            b"description", description,
            b"image_url", image_url,
            b"link", link,
            b"name", name,
            b"project_url", project_url,
            b"attributes", std::string::bytes(&std::string::utf8(b"")),
        );
        
        display::update_version(&mut version);
        display::commit_version(version, display);
    }
}
