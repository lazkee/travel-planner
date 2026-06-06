using AutoMapper;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Mapping;

public class ActivityProfile : Profile
{
    public ActivityProfile()
    {
        CreateMap<TravelActivity, ActivityDto>();
        CreateMap<ActivityRequestDto, TravelActivity>();
    }
}