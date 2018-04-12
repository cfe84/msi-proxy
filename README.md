Picture it: you've been walking alone in the desert for days.
The heat during the day is unbearable, the cold in the night
is preventing you from sleeping. You're exhausted, and your
only chance of survival is to connect to a KeyVault with MSI.
But it doesn't work, and it's hard to diagnose since you can't
run it locally.

Well, fear no more Giusepe, 'cause I got you covered!

This is a function acting like an MSI proxy. You deploy the
function, configure MSI and the resource you want to access,
then define environment variables on your local environment
to point to it, then it acts like if it were running on Azure.

## Disclaimer

This is not intended to be used on production environments. This is
just a developer tool, to help with the integration part of the
project. Although it would "_work_" on production, this would 
completely miss the point of MSI. Don't do it on prod. Please. Don't.

## Usage

1. Deploy the function on Azure, turn MSI on.
2. Add an environment variable to your function called `MSIPROXY_SECRET`.
   This will be the secret your function will check for when receiving
   calls.
3. Configure a resource you want to access to, such as KeyVault ; and grant
   access right to the MSI Proxy function
4. On you local environment, define the following environment variables:
    - `MSI_ENDPOINT`, to point to your function (e.g.: 
      `https://coolfuncs.azurewebsites.net/api/msiproxy`)
    - `MSI_SECRET`, to whatever you've set the `MSIPROXY_SECRET` to.