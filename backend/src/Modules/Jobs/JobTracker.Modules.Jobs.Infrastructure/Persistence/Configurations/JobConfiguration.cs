using JobTracker.Modules.Jobs.Domain.Jobs;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace JobTracker.Modules.Jobs.Infrastructure.Persistence.Configurations;

internal sealed class JobConfiguration : IEntityTypeConfiguration<Job>
{
    public void Configure(EntityTypeBuilder<Job> builder)
    {
        builder.ToTable("jobs");

        builder.HasKey(job => job.Id);

        builder.Property(job => job.Title)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(job => job.Description)
            .HasMaxLength(2000)
            .IsRequired();

        builder.Property(job => job.Status)
            .HasConversion<string>()
            .HasMaxLength(32)
            .IsRequired();

        builder.OwnsOne(job => job.Address, address =>
        {
            address.Property(value => value.Street)
                .HasColumnName("street")
                .HasMaxLength(200)
                .IsRequired();

            address.Property(value => value.City)
                .HasColumnName("city")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(value => value.State)
                .HasColumnName("state")
                .HasMaxLength(100)
                .IsRequired();

            address.Property(value => value.ZipCode)
                .HasColumnName("zip_code")
                .HasMaxLength(20)
                .IsRequired();

            address.Property(value => value.Latitude)
                .HasColumnName("latitude")
                .HasPrecision(9, 6);

            address.Property(value => value.Longitude)
                .HasColumnName("longitude")
                .HasPrecision(9, 6);
        });

        builder.Navigation(job => job.Address)
            .IsRequired();

        builder.HasMany(job => job.Photos)
            .WithOne()
            .HasForeignKey("JobId")
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(job => job.Photos)
            .HasField("_photos")
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(job => job.OrganizationId)
            .HasDatabaseName("ix_jobs_organization_id");

        builder.HasIndex(job => new { job.OrganizationId, job.Status })
            .HasDatabaseName("ix_jobs_organization_id_status");

        builder.HasIndex(job => new { job.OrganizationId, job.ScheduledDate })
            .HasDatabaseName("ix_jobs_organization_id_scheduled_date");
    }
}
