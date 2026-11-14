@echo off
title Sync Android Assets
echo Syncing game files to Android assets folder...
copy /y index.html android\app\src\main\assets\
copy /y style.css android\app\src\main\assets\
copy /y three.min.js android\app\src\main\assets\
copy /y game.js android\app\src\main\assets\
copy /y audio.js android\app\src\main\assets\
copy /y manifest.json android\app\src\main\assets\
copy /y sw.js android\app\src\main\assets\
copy /y icon-192.png android\app\src\main\assets\
copy /y icon-512.png android\app\src\main\assets\
copy /y logo.png android\app\src\main\assets\
echo.
echo All assets successfully synced to android/app/src/main/assets!
