using System.Globalization;
using iText.IO.Font.Constants;
using iText.Kernel.Font;
using iText.Kernel.Pdf;
using iText.Layout;
using iText.Layout.Element;
using iText.Layout.Properties;
using Microsoft.EntityFrameworkCore;
using TravelPlanner.Shared.Common;
using TravelService.Common;
using TravelService.Data;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Services;

public class TravelPlanPdfExportService : ITravelPlanPdfExportService
{
    private readonly TravelDbContext _context;
    private readonly ITravelPlanOwnershipValidator _ownershipValidator;

    public TravelPlanPdfExportService(
        TravelDbContext context,
        ITravelPlanOwnershipValidator ownershipValidator)
    {
        _context = context;
        _ownershipValidator = ownershipValidator;
    }

    public async Task<Result<TravelPlanPdfExportResult>> ExportAsync(int userId, int planId)
    {
        var planError = await _ownershipValidator.ValidateAsync(userId, planId);
        if (planError != null) return Result<TravelPlanPdfExportResult>.Failure(planError);

        var plan = await _context.TravelPlans
            .AsNoTracking()
            .Include(p => p.Destinations)
            .Include(p => p.Activities)
            .Include(p => p.Expenses)
            .Include(p => p.ChecklistItems)
            .FirstOrDefaultAsync(p => p.Id == planId);

        if (plan == null)
            return Result<TravelPlanPdfExportResult>.Failure(TravelServiceErrors.TravelPlanErrors.NotFound);

        var content = GeneratePdf(plan);

        return Result<TravelPlanPdfExportResult>.Success(new TravelPlanPdfExportResult
        {
            Content = content
        });
    }

    private static byte[] GeneratePdf(TravelPlan plan)
    {
        using var stream = new MemoryStream();
        using var writer = new PdfWriter(stream);
        using var pdf = new PdfDocument(writer);
        using var document = new Document(pdf);

        var boldFont = PdfFontFactory.CreateFont(StandardFonts.HELVETICA_BOLD);

        document.Add(new Paragraph("Travel Plan Report")
            .SetFont(boldFont)
            .SetFontSize(20)
            .SetTextAlignment(TextAlignment.CENTER));

        document.Add(new Paragraph($"Trip: {plan.Name}")
            .SetFont(boldFont)
            .SetFontSize(14));
        document.Add(new Paragraph($"Date range: {FormatDate(plan.StartDate)} - {FormatDate(plan.EndDate)}"));
        document.Add(new Paragraph($"Description: {FormatOptional(plan.Description, "No description.")}"));
        document.Add(new Paragraph($"Notes: {FormatOptional(plan.Notes, "No notes.")}"));

        AddBudgetSummary(document, boldFont, plan);
        AddDestinations(document, boldFont, plan);
        AddActivities(document, boldFont, plan);
        AddExpenses(document, boldFont, plan);
        AddChecklistItems(document, boldFont, plan);

        document.Add(new Paragraph($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC")
            .SetFontSize(9)
            .SetTextAlignment(TextAlignment.RIGHT));

        document.Close();
        return stream.ToArray();
    }

    private static void AddBudgetSummary(Document document, PdfFont boldFont, TravelPlan plan)
    {
        var expenseTotal = plan.Expenses.Sum(e => e.Amount);
        var activityEstimates = plan.Activities
            .Where(a => a.EstimatedCost > 0 && a.Status != ActivityStatus.Cancelled)
            .Sum(a => a.EstimatedCost);
        var totalSpent = expenseTotal + activityEstimates;
        var remainingBudget = plan.Budget - totalSpent;

        AddSectionTitle(document, boldFont, "Budget");
        document.Add(new Paragraph($"Budget: {FormatAmount(plan.Budget)}"));
        document.Add(new Paragraph($"Total spent: {FormatAmount(totalSpent)}"));
        document.Add(new Paragraph($"Remaining budget: {FormatAmount(remainingBudget)}"));
    }

    private static void AddDestinations(Document document, PdfFont boldFont, TravelPlan plan)
    {
        AddSectionTitle(document, boldFont, "Destinations");

        var destinations = plan.Destinations
            .OrderBy(d => d.ArrivalDate)
            .ThenBy(d => d.DepartureDate)
            .ThenBy(d => d.Name)
            .ToList();

        if (destinations.Count == 0)
        {
            document.Add(new Paragraph("No destinations."));
            return;
        }

        foreach (var destination in destinations)
        {
            var text = $"{destination.Name}, {destination.Location} ({FormatDate(destination.ArrivalDate)} - {FormatDate(destination.DepartureDate)})";
            document.Add(new Paragraph($"- {text}"));

            if (!string.IsNullOrWhiteSpace(destination.Description))
                document.Add(new Paragraph($"  {destination.Description}").SetFontSize(10));
        }
    }

    private static void AddActivities(Document document, PdfFont boldFont, TravelPlan plan)
    {
        AddSectionTitle(document, boldFont, "Activities");

        var activities = plan.Activities
            .OrderBy(a => a.Date)
            .ThenBy(a => a.Time ?? TimeSpan.MaxValue)
            .ThenBy(a => a.Name)
            .ToList();

        if (activities.Count == 0)
        {
            document.Add(new Paragraph("No activities."));
            return;
        }

        foreach (var activity in activities)
        {
            var time = activity.Time.HasValue ? $" {activity.Time.Value:hh\\:mm}" : string.Empty;
            var location = string.IsNullOrWhiteSpace(activity.Location) ? string.Empty : $" at {activity.Location}";
            var cost = activity.EstimatedCost > 0 ? $", estimate {FormatAmount(activity.EstimatedCost)}" : string.Empty;

            document.Add(new Paragraph(
                $"- {FormatDate(activity.Date)}{time}: {activity.Name}{location} ({activity.Status}{cost})"));

            if (!string.IsNullOrWhiteSpace(activity.Description))
                document.Add(new Paragraph($"  {activity.Description}").SetFontSize(10));
        }
    }

    private static void AddExpenses(Document document, PdfFont boldFont, TravelPlan plan)
    {
        AddSectionTitle(document, boldFont, "Expenses");

        var expenses = plan.Expenses
            .OrderBy(e => e.Date)
            .ThenBy(e => e.Name)
            .ToList();

        if (expenses.Count == 0)
        {
            document.Add(new Paragraph("No expenses."));
            return;
        }

        foreach (var expense in expenses)
        {
            document.Add(new Paragraph(
                $"- {FormatDate(expense.Date)}: {expense.Name} ({expense.Category}) - {FormatAmount(expense.Amount)}"));

            if (!string.IsNullOrWhiteSpace(expense.Description))
                document.Add(new Paragraph($"  {expense.Description}").SetFontSize(10));
        }
    }

    private static void AddChecklistItems(Document document, PdfFont boldFont, TravelPlan plan)
    {
        AddSectionTitle(document, boldFont, "Checklist");

        var checklistItems = plan.ChecklistItems
            .OrderBy(i => i.IsCompleted)
            .ThenBy(i => i.Id)
            .ToList();

        if (checklistItems.Count == 0)
        {
            document.Add(new Paragraph("No checklist items."));
            return;
        }

        foreach (var item in checklistItems)
        {
            var status = item.IsCompleted ? "Done" : "Open";
            document.Add(new Paragraph($"- [{status}] {item.Text}"));
        }
    }

    private static void AddSectionTitle(Document document, PdfFont boldFont, string title)
    {
        document.Add(new Paragraph(title)
            .SetFont(boldFont)
            .SetFontSize(13)
            .SetMarginTop(12)
            .SetMarginBottom(4));
    }

    private static string FormatOptional(string? value, string fallback) =>
        string.IsNullOrWhiteSpace(value) ? fallback : value;

    private static string FormatDate(DateTime value) =>
        value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static string FormatAmount(double amount) =>
        amount.ToString("N2", CultureInfo.InvariantCulture);
}
