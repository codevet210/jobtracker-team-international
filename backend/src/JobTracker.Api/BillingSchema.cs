using Npgsql;

internal static class BillingSchema
{
    public static async Task EnsureCreatedAsync(string connectionString)
    {
        const string sql =
            """
            CREATE SCHEMA IF NOT EXISTS billing;

            CREATE TABLE IF NOT EXISTS billing.invoices (
                id uuid PRIMARY KEY,
                job_id uuid NOT NULL,
                customer_id uuid NOT NULL,
                organization_id uuid NOT NULL,
                completed_at timestamptz NOT NULL,
                idempotency_key text NOT NULL,
                created_at timestamptz NOT NULL,
                CONSTRAINT uq_invoices_idempotency UNIQUE (idempotency_key)
            );
            """;

        await using var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync();
        await using var command = new NpgsqlCommand(sql, connection);
        await command.ExecuteNonQueryAsync();
    }
}
