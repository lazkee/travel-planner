using Microsoft.EntityFrameworkCore;
using TravelService.Models;

namespace TravelService.Data;

public class TravelDbContext : DbContext
{
    public TravelDbContext(DbContextOptions<TravelDbContext> options) : base(options) { }

    public DbSet<TravelPlan> TravelPlans => Set<TravelPlan>();
    public DbSet<Destination> Destinations => Set<Destination>();
    public DbSet<TravelActivity> Activities => Set<TravelActivity>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TravelPlan>(entity =>
        {
            entity.ToTable("TravelPlans");
            entity.HasKey(t => t.Id);
            entity.Property(t => t.UserId).IsRequired();
            entity.Property(t => t.Name).IsRequired().HasMaxLength(200);
            entity.Property(t => t.Description).HasMaxLength(1000);
            entity.Property(t => t.StartDate).IsRequired();
            entity.Property(t => t.EndDate).IsRequired();
            entity.Property(t => t.Budget).IsRequired();
            entity.Property(t => t.Notes).HasMaxLength(2000);
            entity.Property(t => t.CreatedAt).IsRequired();
        });

        modelBuilder.Entity<Destination>(entity =>
        {
            entity.ToTable("Destinations");
            entity.HasKey(d => d.Id);
            entity.Property(d => d.Name).IsRequired().HasMaxLength(200);
            entity.Property(d => d.Location).IsRequired().HasMaxLength(300);
            entity.Property(d => d.ArrivalDate).IsRequired();
            entity.Property(d => d.DepartureDate).IsRequired();
            entity.Property(d => d.Description).HasMaxLength(1000);
            entity.HasOne(d => d.TravelPlan)
                  .WithMany(t => t.Destinations)
                  .HasForeignKey(d => d.TravelPlanId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<TravelActivity>(entity =>
        {
            entity.ToTable("Activities");
            entity.HasKey(a => a.Id);
            entity.Property(a => a.Name).IsRequired().HasMaxLength(200);
            entity.Property(a => a.Date).IsRequired();
            entity.Property(a => a.Location).HasMaxLength(300);
            entity.Property(a => a.Description).HasMaxLength(1000);
            entity.Property(a => a.EstimatedCost).IsRequired();
            entity.Property(a => a.Status).HasConversion<string>();
            entity.HasOne(a => a.TravelPlan)
                  .WithMany(t => t.Activities)
                  .HasForeignKey(a => a.TravelPlanId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.ToTable("Expenses");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Category).HasConversion<string>();
            entity.Property(e => e.Amount).IsRequired();
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.HasOne(e => e.TravelPlan)
                  .WithMany(t => t.Expenses)
                  .HasForeignKey(e => e.TravelPlanId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChecklistItem>(entity =>
        {
            entity.ToTable("ChecklistItems");
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Text).IsRequired().HasMaxLength(300);
            entity.Property(c => c.IsCompleted).IsRequired();
            entity.HasOne(c => c.TravelPlan)
                  .WithMany(t => t.ChecklistItems)
                  .HasForeignKey(c => c.TravelPlanId)
                  .OnDelete(DeleteBehavior.Cascade);
        });
    }
}