using MusicStore.Api.Models;

namespace MusicStore.Api.Services;

public interface IDataGeneratorService
{
    Task<List<SongDto>> GenerateSongsAsync(
        string language, long seed, double likes, int page, int pageSize);
    
    Task<SongDto> GenerateSongDetailsAsync(
        int index, string language, long seed);
}

