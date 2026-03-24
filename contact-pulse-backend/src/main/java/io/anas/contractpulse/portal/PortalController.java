package io.anas.contractpulse.portal;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/portal")
@RequiredArgsConstructor
public class PortalController {

    private final PortalService portalService;

    @GetMapping("/{token}")
    public ResponseEntity<PortalResponse> getPortal(@PathVariable UUID token) {
        return ResponseEntity.ok(portalService.getPortalData(token));
    }
}