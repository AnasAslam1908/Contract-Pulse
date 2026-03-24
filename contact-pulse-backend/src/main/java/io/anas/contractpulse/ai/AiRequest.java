package io.anas.contractpulse.ai;

import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter @Setter
public class AiRequest {
    private UUID contractId;
    private UUID invoiceId;
}