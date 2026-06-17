#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

[ -f "$SCRIPT_DIR/.venv-sf/bin/activate" ] && source "$SCRIPT_DIR/.venv-sf/bin/activate"

CONFIG=Release
TFM=net6.0
RID=linux-x64
APP_NAME=TravelPlannerApp
APP_TYPE=TravelPlannerAppType
APP_VERSION=1.0.0
PKG_ROOT="$SCRIPT_DIR/$APP_NAME/pkg/$APP_NAME"

SERVICES=(UserService TravelService SharingService)

for SVC in "${SERVICES[@]}"; do
  rm -rf "$SCRIPT_DIR/$SVC/publish"
  dotnet publish "$SCRIPT_DIR/$SVC/$SVC.csproj" -c $CONFIG -f $TFM -r $RID --self-contained true -o "$SCRIPT_DIR/$SVC/publish"
done

rm -rf "$PKG_ROOT"
mkdir -p "$PKG_ROOT"

cp "$SCRIPT_DIR/$APP_NAME/ApplicationPackageRoot/ApplicationManifest.xml" "$PKG_ROOT/"

for SVC in "${SERVICES[@]}"; do
  SVC_PKG="$PKG_ROOT/${SVC}Pkg"
  mkdir -p "$SVC_PKG/Code" "$SVC_PKG/Config"
  cp "$SCRIPT_DIR/$SVC/PackageRoot/ServiceManifest.xml" "$SVC_PKG/"
  cp "$SCRIPT_DIR/$SVC/PackageRoot/Config/Settings.xml" "$SVC_PKG/Config/"
  cp -r "$SCRIPT_DIR/$SVC/publish/." "$SVC_PKG/Code/"
  [ -f "$SVC_PKG/Code/$SVC.exe" ] && mv "$SVC_PKG/Code/$SVC.exe" "$SVC_PKG/Code/$SVC"
  chmod +x "$SVC_PKG/Code/$SVC"
  sed -i '' "s|<Program>${SVC}.exe</Program>|<Program>${SVC}</Program>|g" "$SVC_PKG/ServiceManifest.xml"
done

SF_ENDPOINT="http://localhost:19080"

echo "=== Waiting for SF cluster to be ready ==="
until curl -sf "$SF_ENDPOINT/\$/GetClusterHealth?api-version=6.0" | grep -q '"AggregatedHealthState":"Ok"'; do
  echo "  SF not ready yet, retrying in 5s..."
  sleep 5
done
echo "SF cluster is ready."

sfctl cluster select --endpoint "$SF_ENDPOINT"

sfctl application delete --application-id "$APP_NAME" 2>/dev/null || true
sleep 3
sfctl application unprovision --application-type-name "$APP_TYPE" --application-type-version "$APP_VERSION" 2>/dev/null || true
sleep 3

sfctl application upload --path "$PKG_ROOT" --timeout 1200
sfctl application provision --application-type-build-path "$APP_NAME"
sfctl application create \
  --app-name "fabric:/$APP_NAME" \
  --app-type "$APP_TYPE" \
  --app-version "$APP_VERSION"

echo ""
echo "=== Verification ==="
echo "sfctl application list"
echo "sfctl service list --application-id $APP_NAME"
