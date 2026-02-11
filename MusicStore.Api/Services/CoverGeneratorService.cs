using SixLabors.Fonts;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Drawing.Processing;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.PixelFormats;

namespace MusicStore.Api.Services;

public class CoverGeneratorService : ICoverGeneratorService
{
    private readonly FontCollection _fontCollection;
    private FontFamily? _fontFamily;

    public CoverGeneratorService()
    {
        _fontCollection = new FontCollection();
        // Try to load system fonts, fallback to default if not available
        try
        {
            var systemFonts = SystemFonts.CreateFont("Arial", 12);
            _fontFamily = systemFonts.Family;
        }
        catch
        {
            // If system fonts not available, we'll use a simple approach
            _fontFamily = null;
        }
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

        // Add decorative shapes/patterns
        var shapes = random.Next(3, 8);
        for (int i = 0; i < shapes; i++)
        {
            var shapeType = random.Next(0, 3);
            var color = HsvToRgb(
                (bgHue + random.Next(-60, 60) + 360) % 360,
                random.Next(50, 100),
                random.Next(40, 80),
                (byte)random.Next(150, 255));
            
            var x = random.Next(0, width);
            var y = random.Next(0, height);
            var size = random.Next(30, 120);
            
            if (shapeType == 0)
            {
                // Circle
                image.Mutate(ctx => ctx.Draw(
                    color,
                    random.Next(2, 5),
                    new SixLabors.ImageSharp.Drawing.EllipsePolygon(x, y, size, size)));
            }
            else if (shapeType == 1)
            {
                // Rectangle
                image.Mutate(ctx => ctx.Draw(
                    color,
                    random.Next(2, 5),
                    new SixLabors.ImageSharp.Drawing.RectanglePolygon(
                        x, y, size, size)));
            }
        }

        // Add text (album and artist names)
        // Use a simple approach: draw text as shapes if font not available
        var textColor = GetContrastColor(bgColor);
        
        // Draw album title (top)
        DrawText(image, album.ToUpperInvariant(), width / 2, height * 0.25f, 
            Math.Min(32, width / (album.Length + 2)), textColor, true);
        
        // Draw artist name (bottom)
        DrawText(image, artist.ToUpperInvariant(), width / 2, height * 0.75f,
            Math.Min(24, width / (artist.Length + 2)), textColor, false);

        using var ms = new MemoryStream();
        await image.SaveAsync(ms, new PngEncoder());
        var base64 = Convert.ToBase64String(ms.ToArray());
        return $"data:image/png;base64,{base64}";
    }

    private void DrawText(Image<Rgba32> image, string text, float x, float y, float fontSize, Rgba32 color, bool bold)
    {
        if (string.IsNullOrEmpty(text)) return;

        try
        {
            if (_fontFamily != null)
            {
                var font = _fontFamily.CreateFont(fontSize, bold ? FontStyle.Bold : FontStyle.Regular);
                var options = new RichTextOptions(font)
                {
                    Origin = new SixLabors.ImageSharp.PointF(x, y),
                    HorizontalAlignment = HorizontalAlignment.Center,
                    VerticalAlignment = VerticalAlignment.Center
                };
                
                image.Mutate(ctx => ctx.DrawText(options, text, color));
            }
            else
            {
                // Fallback: draw simple rectangles as text representation
                // This is a simplified approach when fonts are not available
                var textWidth = text.Length * fontSize * 0.6f;
                var textHeight = fontSize;
                var rectX = x - textWidth / 2;
                var rectY = y - textHeight / 2;
                
                // Draw background for text
                image.Mutate(ctx => ctx.Fill(
                    new Rgba32(color.R, color.G, color.B, (byte)(color.A * 0.3)),
                    new SixLabors.ImageSharp.Drawing.RectanglePolygon(
                        rectX, rectY, textWidth, textHeight)));
            }
        }
        catch
        {
            // If text rendering fails, skip it
        }
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

