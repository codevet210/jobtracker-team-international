using JobTracker.SharedKernel.Domain;

namespace JobTracker.Modules.Jobs.Domain.Jobs;

public sealed class Address : ValueObject
{
    private Address()
    {
    }

    public Address(
        string street,
        string city,
        string state,
        string zipCode,
        decimal? latitude,
        decimal? longitude)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(street);
        ArgumentException.ThrowIfNullOrWhiteSpace(city);
        ArgumentException.ThrowIfNullOrWhiteSpace(state);
        ArgumentException.ThrowIfNullOrWhiteSpace(zipCode);

        Street = street;
        City = city;
        State = state;
        ZipCode = zipCode;
        Latitude = latitude;
        Longitude = longitude;
    }

    public string Street { get; private set; } = null!;

    public string City { get; private set; } = null!;

    public string State { get; private set; } = null!;

    public string ZipCode { get; private set; } = null!;

    public decimal? Latitude { get; private set; }

    public decimal? Longitude { get; private set; }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return Street;
        yield return City;
        yield return State;
        yield return ZipCode;
        yield return Latitude;
        yield return Longitude;
    }
}