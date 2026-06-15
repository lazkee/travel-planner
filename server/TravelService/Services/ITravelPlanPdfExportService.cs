using TravelPlanner.Shared.Common;
using TravelService.Dtos;

namespace TravelService.Services;

public interface ITravelPlanPdfExportService
{
    Task<Result<TravelPlanPdfExportResult>> ExportAsync(int userId, int planId);
}
