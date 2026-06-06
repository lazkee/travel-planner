using AutoMapper;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Mapping;

public class TravelPlanProfile : Profile
{
    public TravelPlanProfile()
    {
        CreateMap<TravelPlan, TravelPlanDto>();
        CreateMap<TravelPlanRequestDto, TravelPlan>();
    }
}