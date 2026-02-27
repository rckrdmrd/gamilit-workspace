@echo off
set MODELO=gemini-2.5-pro
set API_KEY=AIzaSyADzTx3CDu4GY9edjYaxH6UI1i0xjGyGtg
gemini --model %MODELO% --api-key %API_KEY% --prompt "%~1"
