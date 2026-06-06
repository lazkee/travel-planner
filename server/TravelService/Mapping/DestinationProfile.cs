using AutoMapper;
using TravelService.Dtos;
using TravelService.Models;

namespace TravelService.Mapping;

public class DestinationProfile : Profile
{
    public DestinationProfile()
    {
        CreateMap<Destination, DestinationDto>();
        CreateMap<DestinationRequestDto, Destination>();
    }
}