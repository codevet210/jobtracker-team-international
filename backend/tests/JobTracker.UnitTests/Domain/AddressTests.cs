using JobTracker.Modules.Jobs.Domain.Jobs;
using FluentAssertions;

namespace JobTracker.UnitTests.Domain;

public sealed class AddressTests
{
    [Fact]
    public void Addresses_with_the_same_values_are_equal()
    {
        var left = new Address("1 Main St", "Austin", "TX", "78701", 30.27m, -97.74m);
        var right = new Address("1 Main St", "Austin", "TX", "78701", 30.27m, -97.74m);

        left.Should().Be(right);
        (left == right).Should().BeTrue();
        left.GetHashCode().Should().Be(right.GetHashCode());
    }

    [Fact]
    public void Addresses_with_different_values_are_not_equal()
    {
        var left = new Address("1 Main St", "Austin", "TX", "78701", null, null);
        var right = new Address("2 Main St", "Austin", "TX", "78701", null, null);

        left.Should().NotBe(right);
        (left != right).Should().BeTrue();
    }
}
