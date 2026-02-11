namespace MusicStore.Api.Services;

public interface IMusicGeneratorService
{
    Task<string> GenerateMusicAsync(long seed, string language);
}

