Description:

Here the client I chose to make HTTP Requests is Axios which is promise based.

Advantage of using axios is we can cut out the middle step of passing the 
results of the http request to the .json() method. Axios just returns the data object you would expect.

For the first time, I found it pretty simple but later was having trouble because
of the limitations over the number of requests.

Logic:
I am first making a one request to discover movies and one request to discover tv shows.
Later making request per page and per movie/tv show present on that particular page.

Using set to have distinct cast ids.

Previous Approach: 
I was trying to have a queue and execute mechanism in cyclic manner, after every 10 seconds, 
10 requests will get dispatched and executed but because of some issues it was resulting in an unexpected
behaviour, that's why later chose the simple approach.
----------------------------------------------------------------------------------------
Steps to run:

npm install axios [if not installed]
node index.js

----------------------------------------------------------------------------------------