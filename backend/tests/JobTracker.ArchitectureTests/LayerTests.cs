using FluentAssertions;
using JobTracker.Modules.Jobs.Domain.Jobs;
using NetArchTest.Rules;

namespace JobTracker.ArchitectureTests;

public sealed class LayerTests
{
    [Fact]
    public void Domain_does_not_reference_outer_layers()
    {
        var result = Types.InAssembly(typeof(Job).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                "JobTracker.Modules.Jobs.Application",
                "JobTracker.Modules.Jobs.Infrastructure",
                "JobTracker.Modules.Jobs.Presentation",
                "JobTracker.Api")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Application_does_not_reference_infrastructure_or_presentation()
    {
        var result = Types
            .InAssembly(typeof(JobTracker.Modules.Jobs.Application.DependencyInjection).Assembly)
            .ShouldNot()
            .HaveDependencyOnAny(
                "JobTracker.Modules.Jobs.Infrastructure",
                "JobTracker.Modules.Jobs.Presentation",
                "JobTracker.Api")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Command_handlers_are_internal_and_sealed()
    {
        var result = Types
            .InAssembly(typeof(JobTracker.Modules.Jobs.Application.DependencyInjection).Assembly)
            .That()
            .HaveNameEndingWith("CommandHandler")
            .Should()
            .BeSealed()
            .And()
            .NotBePublic()
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Commands_are_sealed_and_end_with_Command()
    {
        var result = Types
            .InAssembly(typeof(JobTracker.Modules.Jobs.Application.DependencyInjection).Assembly)
            .That()
            .HaveNameEndingWith("Command")
            .Should()
            .BeSealed()
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Query_handlers_are_internal_and_sealed()
    {
        var result = Types
            .InAssembly(typeof(JobTracker.Modules.Jobs.Application.DependencyInjection).Assembly)
            .That()
            .HaveNameEndingWith("QueryHandler")
            .Should()
            .BeSealed()
            .And()
            .NotBePublic()
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }

    [Fact]
    public void Infrastructure_does_not_reference_presentation()
    {
        var result = Types
            .InAssembly(typeof(JobTracker.Modules.Jobs.Infrastructure.DependencyInjection).Assembly)
            .ShouldNot()
            .HaveDependencyOn("JobTracker.Modules.Jobs.Presentation")
            .GetResult();

        result.IsSuccessful.Should().BeTrue();
    }
}
