import { ImageResponse } from "next/og";

export const runtime = "edge";
// Base64 encoded Ethereum logo
const ethLogo =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNTAwIiBoZWlnaHQ9IjI1MDAiIHZpZXdCb3g9IjAgMCAzMiAzMiI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNiIgZmlsbD0iIzYyN0VFQSIvPjxnIGZpbGw9IiNGRkYiIGZpbGwtcnVsZT0ibm9uemVybyI+PHBhdGggZmlsbC1vcGFjaXR5PSIuNjAyIiBkPSJNMTYuNDk4IDR2OC44N2w3LjQ5NyAzLjM1eiIvPjxwYXRoIGQ9Ik0xNi40OTggNEw5IDE2LjIybDcuNDk4LTMuMzV6Ii8+PHBhdGggZmlsbC1vcGFjaXR5PSIuNjAyIiBkPSJNMTYuNDk4IDIxLjk2OHY2LjAyN0wyNCAxNy42MTZ6Ii8+PHBhdGggZD0iTTE2LjQ5OCAyNy45OTV2LTYuMDI4TDkgMTcuNjE2eiIvPjxwYXRoIGZpbGwtb3BhY2l0eT0iLjIiIGQ9Ik0xNi40OTggMjAuNTczbDcuNDk3LTQuMzUzLTcuNDk3LTMuMzQ4eiIvPjxwYXRoIGZpbGwtb3BhY2l0eT0iLjYwMiIgZD0iTTkgMTYuMjJsNy40OTggNC4zNTN2LTcuNzAxeiIvPjwvZz48L2c+PC9zdmc+";

// Base64 encoded EIP.directory logo (dark version)
const eipLogo =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjQ5LjM4NyIgY3k9IjI1MC4xMjciIHI9IjI0Ni4xMjciIGZpbGw9IndoaXRlIi8+PGVsbGlwc2UgY3g9IjI0OC41NzIiIGN5PSIyNTAuMTI3IiByeD0iMjE0LjM0MiIgcnk9IjE5MC43MDgiIGZpbGw9ImJsYWNrIi8+PHBhdGggZD0iTTIwMC44MzEgOS41MTY0MUMxMDMuOTA3IDI4LjcwNjkgMjUuMjAxNiAxMDMuMDQgNS4wMzk0MyAxOTQuNjJDLTIuMjQ4MTEgMjI2LjkyOCAtMS41MTkzNSAyNzIuMTExIDYuNDk2OTQgMzA0LjY2MkMxNC43NTYxIDMzOC4xODQgMzMuOTQ2NyAzNzcuMjk0IDU1LjMyMzQgNDA0LjAxNUM5My4yMTg2IDQ1MS4zODQgMTU0LjkyIDQ4Ni4zNjQgMjExLjI3NyA0OTIuOTIzTDIyNi4wOTUgNDk0LjYyNFYyNTAuMDA1QzIyNi4wOTUgMTguNzQ3MyAyMjUuODUyIDUuNjI5NzIgMjIxLjk2NSA1Ljg3MjY0QzIxOS41MzYgNS44NzI2NCAyMTAuMDYyIDcuNTczMDcgMjAwLjgzMSA5LjUxNjQxWk0xNzcuNTExIDEzNi44MDVWMTk5Ljk2NEgxNTguMDc4SDEzOC42NDRWMTczLjI0M0MxMzguNjQ0IDE1OC40MjUgMTM3LjY3MyAxNDYuNTIyIDEzNi43MDEgMTQ2LjUyMkMxMzIuMDg2IDE0Ni41MjIgMTA3LjMwOCAxNzUuNDI5IDEwMC45OTIgMTg3LjgxOEM5Mi45NzU3IDIwMy44NTEgODYuOTAyOCAyMjMuNTI3IDg5LjA4OSAyMjYuOTI4QzkwLjA2MDcgMjI4LjYyOCA5Ny44MzQxIDIyOS4xMTQgMTA5LjI1MSAyMjguNjI4TDEyNy43MTMgMjI3LjlMMTI4LjQ0MiAyNTAuMjQ4TDEyOS4xNyAyNzIuODM5SDEwOC4yOEg4Ny42MzE1TDg5LjA4OSAyNzkuMzk4QzkzLjcwNDUgMzAwLjA0NiAxMjEuMzk3IDM0NC4wMTQgMTMzLjc4NiAzNTAuNTczQzEzOC40MDEgMzUzLjAwMiAxMzguNjQ0IDM1Mi41MTcgMTM4LjY0NCAzMjkuOTI1VjMwNi44NDhIMTU3LjgzNUgxNzcuMDI1TDE3Ny45OTcgMzY1LjYzNEMxNzguNzI2IDM5OC4xODUgMTc4LjcyNiA0MjUuMzkyIDE3OC4yNCA0MjYuMzY0QzE3Ny4wMjUgNDI5LjAzNiAxNTEuNzYyIDQxNi44OSAxMzMuMDU3IDQwNC45ODdDNzYuNzAwMiAzNjguNTQ5IDQzLjkwNjMgMzEwLjAwNiA0My45MDYzIDI0Ni4zNjFDNDMuOTA2MyAyMDYuMDM3IDU0LjEwODggMTc2Ljg4NyA4MC4xMDExIDE0Mi4zOTNDOTguMDc3IDExOC4zNDQgMTE4LjcyNSAxMDIuMDY4IDE1Mi4wMDUgODUuNzkyNkMxNjUuMzY1IDc4Ljk5MDkgMTc2LjUzOSA3My42NDY3IDE3Ni43ODIgNzMuNjQ2N0MxNzcuMjY4IDczLjY0NjcgMTc3LjUxMSAxMDIuMDY4IDE3Ny41MTEgMTM2LjgwNVoiIGZpbGw9IndoaXRlIi8+PHBhdGggZD0iTTI3Mi4yNDcgMjQ5Ljc2MlY0OTMuODk1SDI3OC4zMkMyOTEuMTk1IDQ5My44OTUgMzIyLjc3NCA0ODUuODc4IDM0Mi42OTMgNDc3LjYxOUM0MDcuMDY3IDQ1MS4xNDEgNDU0LjkyMSA0MDQuOTg3IDQ3OS40NTYgMzQ1LjQ3MkM1MTcuNTk0IDI1My44OTIgNTAyLjA0NyAxNTguOTExIDQzNy42NzQgODcuNzM1OEM0MDcuNTUyIDU0LjQ1NjEgMzUzLjEzOSAyMy4xMTk3IDMwNi4yNTYgMTEuNzAyNUMyOTIuMTY2IDguMzAxNjYgMjc4LjgwNiA1LjYyOTU2IDI3Ni42MiA1LjYyOTU2QzI3Mi40OSA1LjYyOTU2IDI3Mi4yNDcgMTguOTkgMjcyLjI0NyAyNDkuNzYyWk0zNDcuMDY2IDg2Ljc2NDFDMzczLjA1OCA5OS44ODE3IDQwMy42NjYgMTIyLjIzIDQxNy41MTIgMTM4LjI2M0M0MzQuNTE2IDE1OC40MjUgNDQyLjc3NSAxNzcuODU4IDQ0My45OSAyMDIuMTVDNDQ0Ljk2MiAyMTkuMzk3IDQ0NC4yMzMgMjI1LjQ3IDQ0MC4xMDMgMjM2LjY0NEM0MzAuMzg3IDI2MS45MDggNDEwLjQ2NyAyNzguOTEyIDM3OC42NDUgMjg4Ljg3MkwzNjQuNTU2IDI5My4yNDRWMzQ4LjYzVjQwNC4wMTVMMzQ1Ljg1MSA0MTQuOTQ2QzMzNS40MDYgNDIxLjAxOSAzMjUuNjg5IDQyNS44NzggMzIzLjk4OSA0MjUuODc4QzMyMS41NTkgNDI1Ljg3OCAzMjAuODMxIDM5MC44OTcgMzIwLjgzMSAyNTAuOTc3QzMyMC44MzEgMTMzLjY0NyAzMjEuNTU5IDc2LjA3NTggMzIzLjI2IDc2LjA3NThDMzI0LjcxNyA3Ni4wNzU4IDMzNS40MDYgODAuOTM0MSAzNDcuMDY2IDg2Ljc2NDFaIiBmaWxsPSJ3aGl0ZSIvPjxwYXRoIGQ9Ik0zNjQuNTU5IDE5Ny43NzhWMjQ2LjYwNUwzNzEuMzYgMjQ0LjkwNUMzNzUuMDA0IDI0NC4xNzYgMzgxLjU2MyAyNDAuNTMyIDM4NS45MzUgMjM3LjM3NEM0MDkuMjU1IDIxOS4zOTggNDA1Ljg1NSAxODQuNjYxIDM3OC4xNjIgMTU5LjE1NUMzNzIuMDg5IDE1My41NjcgMzY2LjUwMiAxNDguOTUyIDM2NS43NzMgMTQ4Ljk1MkMzNjUuMDQ0IDE0OC45NTIgMzY0LjU1OSAxNzAuODE1IDM2NC41NTkgMTk3Ljc3OFoiIGZpbGw9IndoaXRlIi8+PC9zdmc+";

// Function to fetch the font file
async function getFontData() {
  const response = await fetch(new URL("../../../assets/FiraSans-Bold.ttf", import.meta.url));
  return await response.arrayBuffer();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const number = searchParams.get("number");
  const title = searchParams.get("title");
  const fontData = await getFontData();

  const proposal = `${type}-${number}`;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#4A0E4E",
          color: "white",
          fontFamily: "Fira Sans",
          padding: "40px"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            flex: 1,
            marginTop: "20px"
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: 40
            }}
          >
            <img src={ethLogo} alt="Ethereum logo" width="120" height="120" style={{ marginRight: 30 }} />
            <div
              style={{
                fontSize: 120,
                fontFamily: "Fira Sans"
              }}
            >
              {proposal}
            </div>
          </div>
          <div style={{ fontSize: 56, textAlign: "center", maxWidth: "80%" }}>{title}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: "auto" }}>
          <img src={eipLogo} alt="EIP.directory logo" width="80" height="80" style={{ marginRight: 20 }} />
          <span style={{ fontSize: 52 }}>EIP.directory</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Fira Sans",
          data: fontData,
          weight: 700
        }
      ]
    }
  );
}
