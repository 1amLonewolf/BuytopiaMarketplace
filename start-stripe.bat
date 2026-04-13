@echo off
title Stripe Webhook Forwarder
color 0A
echo.
echo ========================================
echo  Stripe Webhook Forwarder
echo  Forwarding to localhost:5000/api/webhooks/stripe
echo ========================================
echo.
echo Make sure your backend is running on port 5000!
echo.

"C:\Users\Marsden Maima\.stripe-cli\stripe.exe" listen --forward-to localhost:5000/api/webhooks/stripe

pause
