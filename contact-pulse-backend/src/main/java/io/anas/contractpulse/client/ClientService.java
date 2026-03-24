package io.anas.contractpulse.client;

import io.anas.contractpulse.exception.ResourceNotFoundException;
import io.anas.contractpulse.exception.UnauthorizedException;
import io.anas.contractpulse.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClientService {

    private final ClientRepository clientRepository;

    public List<Client> getAllClients(User currentUser) {
        return clientRepository.findByUserId(currentUser.getId());
    }

    public Client getClientById(UUID id, User currentUser) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found"));

        if (!client.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("Access denied");
        }
        return client;
    }

    public Client createClient(ClientRequest request, User currentUser) {
        Client client = Client.builder()
                .user(currentUser)
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .build();

        return clientRepository.save(client);
    }

    public Client updateClient(UUID id, ClientRequest request, User currentUser) {
        Client client = getClientById(id, currentUser);
        client.setName(request.getName());
        client.setEmail(request.getEmail());
        client.setPhone(request.getPhone());
        return clientRepository.save(client);
    }

    public void deleteClient(UUID id, User currentUser) {
        Client client = getClientById(id, currentUser);
        clientRepository.delete(client);
    }
}