package io.anas.contractpulse.client;

import io.anas.contractpulse.user.User;
import io.anas.contractpulse.user.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow();
    }

    @GetMapping
    public ResponseEntity<List<Client>> getAllClients(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(clientService.getAllClients(getUser(userDetails)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Client> getClient(@PathVariable UUID id,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(clientService.getClientById(id, getUser(userDetails)));
    }

    @PostMapping
    public ResponseEntity<Client> createClient(@Valid @RequestBody ClientRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(201).body(clientService.createClient(request, getUser(userDetails)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Client> updateClient(@PathVariable UUID id,
                                               @Valid @RequestBody ClientRequest request,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(clientService.updateClient(id, request, getUser(userDetails)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClient(@PathVariable UUID id,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        clientService.deleteClient(id, getUser(userDetails));
        return ResponseEntity.noContent().build();
    }
}