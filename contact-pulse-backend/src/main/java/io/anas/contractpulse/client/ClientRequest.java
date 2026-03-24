package io.anas.contractpulse.client;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ClientRequest {
    @NotBlank private String name;
    private String email;
    private String phone;
}