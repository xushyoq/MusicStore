using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.PixelFormats;

namespace MusicStore.Api.Services;

public class CoverGeneratorService : ICoverGeneratorService
{
    public CoverGeneratorService()
    {
    }

    public async Task<string> GenerateCoverAsync(string album, string artist, long seed)
    {
        var random = new Random((int)(seed % int.MaxValue));
        var width = 400;
        var height = 400;

        using var image = new Image<Rgba32>(width, height);
        
        // Random background color with better contrast
        var bgHue = random.Next(0, 360);
        var bgColor = HsvToRgb(bgHue, random.Next(30, 70), random.Next(60, 90));
        
        image.Mutate(ctx => ctx.BackgroundColor(bgColor));

        // Add decorative shapes/patterns using simple rectangles
        var shapes = random.Next(3, 8);
        for (int i = 0; i < shapes; i++)
        {
            var color = HsvToRgb(
                (bgHue + random.Next(-60, 60) + 360) % 360,
                random.Next(50, 100),
                random.Next(40, 80),
                (byte)random.Next(150, 255));
            
            var x = random.Next(0, width);
            var y = random.Next(0, height);
            var size = random.Next(30, 120);
            
            // Draw simple rectangle
            image.Mutate(ctx => ctx.Fill(color, new Rectangle(x, y, size, size)));
        }

        // Add text representation using colored rectangles
        var textColor = GetContrastColor(bgColor);
        
        // Draw album title representation (top)
        DrawTextPlaceholder(image, album.ToUpperInvariant(), width / 2, height * 0.25f, 
            Math.Min(32, width / (album.Length + 2)), textColor);
        
        // Draw artist name representation (bottom)
        DrawTextPlaceholder(image, artist.ToUpperInvariant(), width / 2, height * 0.75f,
            Math.Min(24, width / (artist.Length + 2)), textColor);

        using var ms = new MemoryStream();
        await image.SaveAsync(ms, new PngEncoder());
        var base64 = Convert.ToBase64String(ms.ToArray());
        return $"data:image/png;base64,{base64}";
    }

    private void DrawTextPlaceholder(Image<Rgba32> image, string text, float x, float y, float fontSize, Rgba32 color)
    {
        if (string.IsNullOrEmpty(text)) return;

        // Draw simple rectangles as text representation
        var textWidth = (int)(text.Length * fontSize * 0.6f);
        var textHeight = (int)fontSize;
        var rectX = (int)(x - textWidth / 2);
        var rectY = (int)(y - textHeight / 2);
        
        // Draw background for text
        image.Mutate(ctx => ctx.Fill(
            new Rgba32(color.R, color.G, color.B, (byte)(color.A * 0.3)),
            new Rectangle(rectX, rectY, textWidth, textHeight)));
    }

    private Rgba32 HsvToRgb(int h, int s, int v, byte alpha = 255)
    {
        float H = h / 360f;
        float S = s / 100f;
        float V = v / 100f;

        int i = (int)(H * 6);
        float f = H * 6 - i;
        float p = V * (1 - S);
        float q = V * (1 - f * S);
        float t = V * (1 - (1 - f) * S);

        float r, g, b;
        switch (i % 6)
        {
            case 0: r = V; g = t; b = p; break;
            case 1: r = q; g = V; b = p; break;
            case 2: r = p; g = V; b = t; break;
            case 3: r = p; g = q; b = V; break;
            case 4: r = t; g = p; b = V; break;
            case 5: r = V; g = p; b = q; break;
            default: r = g = b = 0; break;
        }

        return new Rgba32(
            (byte)(r * 255),
            (byte)(g * 255),
            (byte)(b * 255),
            alpha);
    }

    private Rgba32 GetContrastColor(Rgba32 bgColor)
    {
        // Calculate luminance
        var luminance = (0.299 * bgColor.R + 0.587 * bgColor.G + 0.114 * bgColor.B) / 255;
        return luminance > 0.5 ? new Rgba32(0, 0, 0, 255) : new Rgba32(255, 255, 255, 255);
    }
}

