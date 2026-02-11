namespace MusicStore.Api.Services;

public interface ICoverGeneratorService
{
    Task<string> GenerateCoverAsync(string album, string artist, long seed);
}

