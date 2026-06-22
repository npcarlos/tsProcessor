@echo off
echo === Generando colecciones geograficas ===
echo.

echo [1/4] Generando states...
echo generateStates.main(); > temp_script.txt
node -e "const g = require('./dist/processors/generateStates'); g.main();"
echo.

echo [2/4] Generando cities...
node -e "const g = require('./dist/processors/generateCities'); g.main();"
echo.

echo [3/4] Aplicando aliases...
node -e "const a = require('./dist/processors/applyAliases'); a.main();"
echo.

echo [4/4] Verificando completitud...
node -e "const v = require('./dist/processors/verifyStates'); v.main();"
echo.

echo === Proceso completado ===
