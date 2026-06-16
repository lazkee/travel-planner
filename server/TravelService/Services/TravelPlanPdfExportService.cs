using System.Globalization;
using iText.IO.Font.Constants;
using iText.IO.Image;
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
    private readonly ISharingClientService _sharingClientService;

    public TravelPlanPdfExportService(
        TravelDbContext context,
        ITravelPlanOwnershipValidator ownershipValidator,
        ISharingClientService sharingClientService)
    {
        _context = context;
        _ownershipValidator = ownershipValidator;
        _sharingClientService = sharingClientService;
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

        List<ShareResponseDto>? shares = null;
        try
        {
            var sharesResult = await _sharingClientService.GetSharesForPlanAsync(planId);
            if (sharesResult.IsSuccess && sharesResult.Value is { Count: > 0 })
                shares = sharesResult.Value;
        }
        catch
        {
            shares = null;
        }

        var content = GeneratePdf(plan, shares);

        return Result<TravelPlanPdfExportResult>.Success(new TravelPlanPdfExportResult
        {
            Content = content
        });
    }

    private static byte[] GeneratePdf(TravelPlan plan, List<ShareResponseDto>? shares)
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

        AddTripOverview(document, boldFont, plan);
        AddBudgetSummary(document, boldFont, plan);
        AddDestinations(document, boldFont, plan);
        AddActivities(document, boldFont, plan);
        AddExpenses(document, boldFont, plan);
        AddChecklistItems(document, boldFont, plan);

        if (shares != null)
            AddSharedAccess(document, boldFont, shares);

        document.Add(new Paragraph($"Generated: {DateTime.UtcNow:yyyy-MM-dd HH:mm} UTC")
            .SetFontSize(9)
            .SetTextAlignment(TextAlignment.RIGHT));

        document.Close();
        return stream.ToArray();
    }

    private static void AddTripOverview(Document document, PdfFont boldFont, TravelPlan plan)
    {
        AddSectionTitle(document, boldFont, "Trip overview");

        var table = new Table(UnitValue.CreatePercentArray(new float[] { 25, 75 }))
            .UseAllAvailableWidth();

        table.AddCell(BoldCell("Trip", boldFont));
        table.AddCell(DataCell(plan.Name));

        table.AddCell(BoldCell("Date range", boldFont));
        table.AddCell(DataCell($"{FormatDate(plan.StartDate)} – {FormatDate(plan.EndDate)}"));

        table.AddCell(BoldCell("Description", boldFont));
        table.AddCell(DataCell(FormatOptional(plan.Description, "—")));

        table.AddCell(BoldCell("Notes", boldFont));
        table.AddCell(DataCell(FormatOptional(plan.Notes, "—")));

        document.Add(table);
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

        var table = new Table(UnitValue.CreatePercentArray(new float[] { 55, 45 }))
            .UseAllAvailableWidth();

        table.AddHeaderCell(BoldCell("Item", boldFont));
        table.AddHeaderCell(BoldCell("Amount", boldFont));

        table.AddCell(DataCell("Budget"));
        table.AddCell(DataCell(FormatMoney(plan.Budget)));

        table.AddCell(DataCell("Total spent"));
        table.AddCell(DataCell(FormatMoney(totalSpent)));

        table.AddCell(DataCell("Remaining budget"));
        table.AddCell(DataCell(FormatMoney(remainingBudget)));

        document.Add(table);
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

        var table = new Table(UnitValue.CreatePercentArray(new float[] { 28, 28, 22, 22 }))
            .UseAllAvailableWidth();

        table.AddHeaderCell(BoldCell("Name", boldFont));
        table.AddHeaderCell(BoldCell("Location", boldFont));
        table.AddHeaderCell(BoldCell("Arrival", boldFont));
        table.AddHeaderCell(BoldCell("Departure", boldFont));

        foreach (var d in destinations)
        {
            table.AddCell(DataCell(d.Name));
            table.AddCell(DataCell(d.Location));
            table.AddCell(DataCell(FormatDate(d.ArrivalDate)));
            table.AddCell(DataCell(FormatDate(d.DepartureDate)));

            if (!string.IsNullOrWhiteSpace(d.Description))
                table.AddCell(new Cell(1, 4)
                    .Add(new Paragraph(d.Description).SetFontSize(9)));
        }

        document.Add(table);
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

        var table = new Table(UnitValue.CreatePercentArray(new float[] { 13, 10, 22, 20, 15, 20 }))
            .UseAllAvailableWidth();

        table.AddHeaderCell(BoldCell("Date", boldFont));
        table.AddHeaderCell(BoldCell("Time", boldFont));
        table.AddHeaderCell(BoldCell("Name", boldFont));
        table.AddHeaderCell(BoldCell("Location", boldFont));
        table.AddHeaderCell(BoldCell("Status", boldFont));
        table.AddHeaderCell(BoldCell("Est. cost", boldFont));

        foreach (var a in activities)
        {
            var time = a.Time.HasValue ? a.Time.Value.ToString(@"hh\:mm") : "—";
            var cost = a.EstimatedCost > 0 ? FormatMoney(a.EstimatedCost) : "—";

            table.AddCell(DataCell(FormatDate(a.Date)));
            table.AddCell(DataCell(time));
            table.AddCell(DataCell(a.Name));
            table.AddCell(DataCell(FormatOptional(a.Location, "—")));
            table.AddCell(DataCell(a.Status.ToString()));
            table.AddCell(DataCell(cost));

            if (!string.IsNullOrWhiteSpace(a.Description))
                table.AddCell(new Cell(1, 6)
                    .Add(new Paragraph(a.Description).SetFontSize(9)));
        }

        document.Add(table);
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

        var table = new Table(UnitValue.CreatePercentArray(new float[] { 15, 35, 25, 25 }))
            .UseAllAvailableWidth();

        table.AddHeaderCell(BoldCell("Date", boldFont));
        table.AddHeaderCell(BoldCell("Name", boldFont));
        table.AddHeaderCell(BoldCell("Category", boldFont));
        table.AddHeaderCell(BoldCell("Amount", boldFont));

        foreach (var e in expenses)
        {
            table.AddCell(DataCell(FormatDate(e.Date)));
            table.AddCell(DataCell(e.Name));
            table.AddCell(DataCell(e.Category.ToString()));
            table.AddCell(DataCell(FormatMoney(e.Amount)));

            if (!string.IsNullOrWhiteSpace(e.Description))
                table.AddCell(new Cell(1, 4)
                    .Add(new Paragraph(e.Description).SetFontSize(9)));
        }

        document.Add(table);
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

        var table = new Table(UnitValue.CreatePercentArray(new float[] { 15, 85 }))
            .UseAllAvailableWidth();

        table.AddHeaderCell(BoldCell("Status", boldFont));
        table.AddHeaderCell(BoldCell("Item", boldFont));

        foreach (var item in checklistItems)
        {
            table.AddCell(DataCell(item.IsCompleted ? "Done" : "Open"));
            table.AddCell(DataCell(item.Text));
        }

        document.Add(table);
    }

    private static void AddSharedAccess(Document document, PdfFont boldFont, List<ShareResponseDto> shares)
    {
        AddSectionTitle(document, boldFont, "Shared access");

        const string dataUrlPrefix = "data:image/png;base64,";

        foreach (var share in shares)
        {
            var table = new Table(UnitValue.CreatePercentArray(new float[] { 25, 75 }))
                .UseAllAvailableWidth();

            table.AddCell(BoldCell("Access", boldFont));
            table.AddCell(DataCell(share.AccessLevel.ToString()));

            table.AddCell(BoldCell("Expires", boldFont));
            table.AddCell(DataCell($"{share.ExpiresAtUtc:yyyy-MM-dd HH:mm} UTC"));

            table.AddCell(BoldCell("URL", boldFont));
            table.AddCell(new Cell().Add(new Paragraph(share.ShareUrl).SetFontSize(8)));

            document.Add(table);

            if (!string.IsNullOrWhiteSpace(share.QrCodeDataUrl))
            {
                var base64 = share.QrCodeDataUrl.StartsWith(dataUrlPrefix)
                    ? share.QrCodeDataUrl[dataUrlPrefix.Length..]
                    : share.QrCodeDataUrl;

                try
                {
                    var imageBytes = Convert.FromBase64String(base64);
                    var imageData = ImageDataFactory.Create(imageBytes);
                    document.Add(new Image(imageData).ScaleToFit(120, 120).SetMarginTop(4));
                }
                catch
                {
                    // Skip QR image if decoding fails; text info is already rendered above
                }
            }

            document.Add(new Paragraph(" ").SetMarginBottom(8));
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

    private static Cell BoldCell(string text, PdfFont boldFont) =>
        new Cell().Add(new Paragraph(text).SetFont(boldFont).SetFontSize(10));

    private static Cell DataCell(string text) =>
        new Cell().Add(new Paragraph(text).SetFontSize(10));

    private static string FormatOptional(string? value, string fallback) =>
        string.IsNullOrWhiteSpace(value) ? fallback : value;

    private static string FormatDate(DateTime value) =>
        value.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

    private static string FormatMoney(double amount) =>
        amount >= 0
            ? "$" + amount.ToString("N2", CultureInfo.InvariantCulture)
            : "-$" + Math.Abs(amount).ToString("N2", CultureInfo.InvariantCulture);
}