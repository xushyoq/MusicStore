FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT:-8080}

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MusicStore.Api/MusicStore.Api.csproj", "MusicStore.Api/"]
RUN dotnet restore "MusicStore.Api/MusicStore.Api.csproj"
COPY . .
WORKDIR "/src/MusicStore.Api"
RUN dotnet build "MusicStore.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "MusicStore.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MusicStore.Api.dll"]

