using Microsoft.Extensions.Configuration;
using Npgsql;

namespace JobTracker.Modules.Billing.Invoices;

internal sealed class PostgresInvoiceStore : IInvoiceStore
{
    private readonly string _connectionString;

    public PostgresInvoiceStore(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("Database")
            ?? throw new InvalidOperationException("Connection string 'Database' is not configured.");
    }

    public async Task<bool> TryCreateInvoiceAsync(
        Guid jobId,
        Guid customerId,
        Guid organizationId,
        DateTimeOffset completedAt,
        CancellationToken cancellationToken = default)
    {
        const string sql =
            """
            INSERT INTO billing.invoices (
                id,
                job_id,
                customer_id,
                organization_id,
                completed_at,
                idempotency_key,
                created_at)
            VALUES (
                @id,
                @jobId,
                @customerId,
                @organizationId,
                @completedAt,
                @idempotencyKey,
                @createdAt)
            ON CONFLICT (idempotency_key) DO NOTHING;
            """;

        var idempotencyKey = $"{jobId:N}:{completedAt.UtcDateTime:O}";

        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);

        await using var command = new NpgsqlCommand(sql, connection);
        command.Parameters.AddWithValue("id", Guid.NewGuid());
        command.Parameters.AddWithValue("jobId", jobId);
        command.Parameters.AddWithValue("customerId", customerId);
        command.Parameters.AddWithValue("organizationId", organizationId);
        command.Parameters.AddWithValue("completedAt", completedAt);
        command.Parameters.AddWithValue("idempotencyKey", idempotencyKey);
        command.Parameters.AddWithValue("createdAt", DateTimeOffset.UtcNow);

        var rows = await command.ExecuteNonQueryAsync(cancellationToken);
        return rows > 0;
    }
}
