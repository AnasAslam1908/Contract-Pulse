-- Users
CREATE TABLE users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       name VARCHAR(100) NOT NULL,
                       email VARCHAR(150) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       role VARCHAR(20) NOT NULL DEFAULT 'FREELANCER',
                       created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                         name VARCHAR(100) NOT NULL,
                         email VARCHAR(150),
                         phone VARCHAR(20),
                         created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Contracts
CREATE TABLE contracts (
                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                           user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                           client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
                           title VARCHAR(200) NOT NULL,
                           description TEXT,
                           total_value NUMERIC(12,2) NOT NULL DEFAULT 0,
                           status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
                           public_token UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
                           start_date DATE,
                           end_date DATE,
                           created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
                            title VARCHAR(200) NOT NULL,
                            amount NUMERIC(12,2) NOT NULL DEFAULT 0,
                            due_date DATE,
                            status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                            order_index INT NOT NULL DEFAULT 0,
                            created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          milestone_id UUID NOT NULL UNIQUE REFERENCES milestones(id) ON DELETE CASCADE,
                          invoice_number VARCHAR(50) NOT NULL UNIQUE,
                          amount NUMERIC(12,2) NOT NULL,
                          status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                          issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
                          due_date DATE,
                          pdf_path VARCHAR(500),
                          created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- AI Logs
CREATE TABLE ai_logs (
                         id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                         contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
                         feature_type VARCHAR(50) NOT NULL,
                         prompt TEXT,
                         response TEXT,
                         created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_contracts_user_id ON contracts(user_id);
CREATE INDEX idx_contracts_client_id ON contracts(client_id);
CREATE INDEX idx_contracts_public_token ON contracts(public_token);
CREATE INDEX idx_milestones_contract_id ON milestones(contract_id);
CREATE INDEX idx_invoices_milestone_id ON invoices(milestone_id);
CREATE INDEX idx_ai_logs_contract_id ON ai_logs(contract_id);
