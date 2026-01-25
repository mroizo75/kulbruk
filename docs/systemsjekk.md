ETG API Pre-Certification Checklist 

Necessary: Please create a copy of this document and return it once it is completed. 
	
This document is the test checklist that starts the certification process. Given the nature of this document, the questions will contain correct and incorrect answers. To start, please cross-check your integration and provide answers to the below points. 
Moreover, as indicated in the Integration and Certification Guidelines, please provide access to the website / mobile application / API you’ve built so we can independently verify the necessary points. 
. 
If our verification confirms that the responses here correlate to what we see in your product, we will close this point immediately. 
If our verification identifies differences from the expectations in this document, we will discuss these differences further with you. 

	Your product will be certified based on the expectations outlined in this checklist. If all criteria are executed as expected, then the certification process may be completed using this checklist alone. 

	All these points are based on the information provided in the Best Practices. Please refer to this document for more details.

General


Map Test Hotels: Please map the test hotel, hid = 8473727 or id = “test_hotel_do_not_book”. This is mandatory. 
Product Type for Certification: Please specify what partner’s product is going to be certified, and indicate if the necessary access / materials have been provided. 
	1. Website OR Mobile App (provide ETG access to test search and booking functionalities to start the certification process. ETG should be activated as a Provider) 
Access to the website has been provided. 
Access to the website cannot be granted. Please find the video-recording / screenshots attached to the e-mail 
The installation file of the mobile app is provided (optional). 
2. API (partner provides its API to third parties for integration)
The API documentation is provided (mandatory).
The logs of response and request from partner’s API and Ratehawk API for 1 completed test booking (mandatory). 
Comparison Diagram: Send a diagram comparing ETG API endpoints with your site/API flow. 
Yes, please find the diagram attached to the email 
We can not provide a diagram 
Testing: Run multiple tests with properties, covering each potential anomaly from your end, and also include our anomalies such as:
Upsells Booking if you implement this feature 
Multiroom booking if you implement this feature 
Booking with child 
All the cases that are considered unusual  from your perspective 
Payment types: Please choose what kind of payment types you will use. 
Possible payment types:
“hotel” - payment at the hotel. This type is available for Affiliate API. 
“deposit” - the payment comes from a partner's deposit. This  type is available for  the B2B API
“now” - ETG charges the card provided during the booking process. 
Сheck the boxes below if you are using the “now” payment type:
Have you integrated the “Create credit card token (/manage/init_partners)” endpoint? 
Yes
No
Do you send “pay_uuid”, “init_uuid”, and “return_path” in your request for “Start booking process”?
Yes
No 
Have you already provided a host name (domain) to work with 3ds? 
Yes
No
Please make a booking with a card. Refer to the test card requirements in Best Practices 
Yes, here is the order ID: write test order ID 
We have not been able to make a booking due to errors 
IP Whitelisting on ETG end: Please provide the list of your IP addresses that need to be whitelisted. This is mandatory on our end.
Yes, here are our IP addresses: provide the list of IP addresses is here
We use  dynamic IP addresses
Required Endpoints for Implementation: Please choose implemented endpoints. 
/api/b2b/v3/hotel/info/dump/
Yes, implemented 
No, not implemented 
/api/b2b/v3/hotel/info/incremental_dump/
Yes, implemented 
No, not implemented 
One of /api/b2b/v3/search/serp/ 
Yes ,/hotels/ implemented 
Yes, /geo/ implemented 
Yes, /region/ implemented
No, we did not implement any search type requests 
/api/b2b/v3/search/hp/
Yes, implemented 
No, not implemented 
/api/b2b/v3/hotel/prebook/ 
Yes, implemented 
No, not implemented 
api/b2b/v3/hotel/order/booking/form/
Yes, implemented 
No, not implemented 
/api/b2b/v3/hotel/order/booking/finish/
Yes, implemented 
No, not implemented 
api/b2b/v3/hotel/order/booking/finish/status/ or Webhooks (one of them is required)
Yes, implemented 
No, not implemented 
Did you implement other endpoints? 
Yes, we implemented  …
No, only the ones mentioned above
Static Data

Hotel static data Upload and Updates: Please integrate the “Retrieve hotel dump” (/hotel/info/dump/) and update it weekly. You can also incorporate the Hotel “Incremental Data Dump” (/hotel/info/incremental_dump/) and update it daily.
We will update the hotel static data using the “Retrieve hotel dump” method
We will update the hotel static data using the “Retrieve hotel incremental dump” method
We will update the hotel static data using both the “Retrieve hotel incremental dump” and “Retrieve hotel dump” methods 
We don’t use any of the dumps
We use “Retrieve hotel content” (/hotel/info) to get the static data 
We use third-party services (e.g., GIATA, Vervotech, etc.)
We have  implemented a different logic: indicate the logic
We use Content API 
In case you use Content API, please indicate how do you use it:
We use it to enrich the website with the static data in realtime 
We use it to download the static data and store in a database, and get the static data from the database 
Other: indicate the logic
Please specify how often you will update static data 
Weekly 
Daily 
Other: indicate the logic

If you work with “Search by region” (/serp/region), how do you update the destinations? 
We use “Retrieve regions’ dump” and get region ids from this file 
We use “Retrieve hotel dump” and get region ids from this file 
We use Content API 
Please specify how often you will update the region data 
Daily 
Weekly
Other: indicate the logic 
The number of mapped regions/hotels: Please indicate the number of mapped hotels and regions. The exact number of hotels and regions is appreciated, but an approximate number would also suffice. 
All hotels 
Other number of hotels: indicate the number
All regions 
Other number of regions: indicate the number
Hotel important information: Parse and reflect information from "metapolicy_struct" and "metapolicy_extra_info". 
Yes, we parse and display data from the "metapolicy_struct" and "metapolicy_extra_info" parameters
Yes, we parse and display data from the "policy_struct" and "metapolicy_extra_info" parameters
Yes, we parse and display data from the "metapolicy_struct" only
Yes, we parse and display data from the "metapolicy_extra_info" only 
Yes, we parse and display data from the "policy_struct" only
No 
Room Static data: Please indicate if you work with room static data (images and amenities).
Yes, we show room images and amenities 
No, we do not show room images and amenities
If you work with room static data, please choose what parameter you use to match it with dynamic data. 
“room_name” 
“room_group_id” 
“room_name” and “room_group_id” 
“rg_ext”
Other: indicate the logic 
Search step


Search Flow: Please indicate your search logic, whether it is 3-steps or 2-steps. 
2-steps search 
3-steps search 
Other: indicate the logic
Match_hash usage: Please indicate if you use match_hash. If yes, expand on the logic. 
Yes, we use “match_hash”: indicate the logic
No, we do not use “match_hash” 
Prebook rate from hotelpage step (/hotel/prebook/): Please integrate “Prebook rate from hotelpage step” and inform the customer if the price changes.
Yes, we use “Prebook rate from hotelpage step” 
No, we do not use “Prebook rate from hotelpage step”
Please separate “Prebook rate from hotelpage step” from your booking step. Instead, make it a separate or a part of the search step. 
Yes, it is a separate step 
No, it is not a separate step 
Implement “price_increase_percent” if your system supports it. 
Yes, “price_increase_percent” is supported
No, “price_increase_percent” is not supported 
Describe the logic for using price_increase_percent and let us know your default value for price_increase_percent. 
0% 
10%
20%
Other: Please indicate your value of price_increase_percent  
If “price_increase_percent” is used, do you show a notification to users about the price change?
Yes
No 
“Prebook rate from hotelpage step” is implemented according to ETG timeout limitation (60s).
Yes
No
Other: Please indicate your expected timeout
Cache: Please specify if you cache the following endpoints: 
We don’t cache
We cache search/serp/hotels 
If you cache: please indicate the caching time
We cache search/serp/geo
If you cache: please indicate the caching time
We cache search/serp/region
If you cache: please indicate the caching time
We cache search/hp
If you cache: please indicate the caching time
Children Logic: Please specify how you work with children.
Yes, we accommodate children up to and including 17 years of age. 
Yes, we accommodate children, with support for varying age limits 
No, we do not work with children 
Please clarify how you specify the age of the children 
Age is mentioned in the comments during the “Start booking process” (/order/booking/form/) 
Age is specified in all search requests within [] under  “guests” > “children” parameter; for “Start booking process” (/order/booking/form/) request, the child’s age is specified under “guests” > “age” parameter
Age is informed by reaching out to your support team  
 Multiroom booking: Specify if you work with multiroom booking and elaborate on the logic. 
No, we do not  work with multiroom-booking 
Yes, we work and support only multiroom-booking of the same room types
Yes, we work and support multiroom-booking of different room types 
Yes, we support multiroom-booking of both the same and different room types

If you work with multibooking, please make a booking and share the order ID with us here.
Testing requirements:  
2 Adults + 1 Child (5 y.o) in 1 room, and 2 adults in another room. 
Residency: “uz”.
	Test Order IDs: please indicate the test order ID conducted

Tax and Fees Data: Please choose how you work with tax and fees data
We display all taxes and fees (both included and non-included) separately 
We include all taxes (both included and excluded) in the total price
We display only non-included taxes separately 
We do not work with extra taxes 
Other: indicate the logic
Dynamic Search Timeouts: If dynamic timeouts are used, the “timeout” parameter must be included in the search request. 
Yes
No 
Expected Search Timeout: please indicate what timeout you expect to get 
Answer: 
Maximum Search Timeout: please indicate what maximum search timeout you would allow 
Answer: 
Cancellation Policies: Please specify if you parse and display cancellation policies:
No, we do not display cancellation policies
Yes, we parse and display them from “cancellation_penalties” in the API search responses
Please specify if you modify cancellation policies from the API:
No, we do not modify policies; we show them as they are
Yes, we modify policies by making them more restrictive
Yes, we modify policies by making them more flexible
Please specify how you handle the cancellation deadline date, time, and timezone from the API:
We display the cancellation deadline time in UTC+0 and show the UTC+0 timezone in the interface
We convert the cancellation deadline time to the user's local timezone and show the user's local timezone in the interface
We do not show the timezone; we display only the cancellation deadline date
Other: indicate the logic here
Lead Guest’s Citizenship: Please specify if you integrated citizenship/residency on the first search step:
No, we do not request the citizenship data; we do not use the “residency” parameter in the API requests 
No, we do not request the citizenship data; in the search API requests (/search/serp/*/ and /search/hp/), we send the default (hardcoded) value in the “residency” parameter 
No, we request the citizenship data on the booking step
Yes, we collect  the citizenship data on the first search step and work with the “residency” parameter
Please specify how you work with citizenship /residency:
We request  the citizenship data on the first search step via a drop-down and send the “residency” parameter in the /search/serp/*/ and /search/hp/ requests based on the user selection
We determine the lead guest residency based on the IP address and send the “residency” parameter in the /search/serp/*/ and /search/hp/ requests accordingly
Other: indicate the logic here
Meal Types: Please specify how you work with ETG meal types:
We do not work with the meal types from the API
We display ETG meal types as they are returned in the API search responses
We receive ETG meal types from the API search responses, find their translation in /hotel/static/, and display their translation
We receive ETG meal types from the API search responses, map them with our own meal types, and display our meal types
If you map ETG meal types with your own and display your own meal types, please fill out the cross-mapping table below: 


ETG meal type
How the partner displays the meal type
all-inclusive


american-breakfast


asian-breakfast


breakfast


breakfast-buffet


breakfast-for-1


breakfast-for-2


chinese-breakfast


continental-breakfast


dinner


english-breakfast


full-board


half-board


half-board-dinner


half-board-lunch


irish-breakfast


israeli-breakfast


japanese-breakfast


lunch


nomeal


scandinavian-breakfast


scottish-breakfast


soft-all-inclusive


some-meal


super-all-inclusive


ultra-all-inclusive





Please specify the parameter you use to parse meal type data from the API:

“meal” from the API search responses
“meal_data.value” from the API search responses
We parse and show all info in “meal_data” (value, has_breakfast, no_child_meal) from the API search responses
Final price: Please specify what parameter you use to parse the price. 
“amount”
“show_amount” 
“commision_info.charge.amount_net”
“commission_info.charge.amount_gross” 
“daily_price” 
Commission: Please choose what commission model you use. You can select only one option. 
Not applicable if you are working with affiliate API
“Net” and commission are calculated on the ETG end 
“Net” and commission are calculated on partner’s end 
“Gross” and commission are calculated on the ETG end 
“Gross” and commission are calculated on partner’s end 
Rate name reflection: Please choose what parameter you use to parse the rate name.
“room_data_trans.main_room_type” from /search/hp/
“room_data_trans.main_name” from /search/hp/
“room_name” from /search/hp/
“room_groups[n].name” from the static data
“room_groups[n].name_struct.main_name” from the static data
Other: indicate the logic

Please choose if you map our rooms with your rooms. 
We display ETG room names as they are
We map our rooms with ETG rooms 
Early check-in / Late check-out: Please specify if you work with upsells. 
Not applicable if you are working with the affiliate API
Yes, we work with upsells 
If you work with upsells, please create a booking with upsells 
No, we do not and will not work with upsells in the future
We do not work with upsells for now, but we plan to integrate it at a later stage 
Hotel chunk size: In case you use /api/b2b/v3/search/serp/hotels, please specify what will be the number of hotels sent in 1 request.
Real number of hotel chunk size: Please write the exact real number of hotel chunk size 
Answer: 
Maximum number of hotel chunk size: Please write the exact maximum number of hotel chunk size 
Answer: 
Rates Filtration Logic: Please choose how you filter rates from different suppliers on the search step. 
We display only the cheapest rate from each supplier 
We display all rates from each supplier
We display only the fastest received rates from each supplier 
By room type
Other: please specify the logic 
ETG is the only supplier
Booking Step

Test Bookings: Create test bookings in one of ETG's test hotels with the following criteria:
Multi-room booking, if applicable
2 Adults + 1 Child in 1 room, and 2 adults in other room
Residency set to “uz”
Receiving the final booking status: Please choose the logic when you show the successful status to a user (only one indicator from ETG should be considered and selected as booking success). 
Status OK in “Start booking process” (/order/booking/finish/)
Status OK in “Check booking process”(/order/booking/finish/status/)
Status Completed via “Receive booking status webhook” 
After successful “Retrieve bookings” (/order/info/) response 
Other: indicate the logic

Please choose what endpoint you use to get the final booking status (only one endpoint from ETG should be considered and selected as booking success):
“Retrieve bookings” (/order/info/)
“Receive booking status webhook”
Please specify if you have provided your webhook URL.
Yes
No
“Start booking process” (/order/booking/finish/)
“Check booking process” (/order/booking/finish/status/)

Booking cut-off: Please specify your desired booking timeout.
Expected Booking Timeout: please indicate what booking timeout you expect to get 
Answer: 
Maximum Booking Timeout: please indicate what maximum booking timeout you would allow 
Answer: 
Errors and Statuses Processing Logic: Please indicate how you process the statuses and errors provided below and provide its corresponding statuses on your end.  
Endpoint: https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/ 
ETG API
Partner’s Status on Frontend 
The processing logic on Backend 
Status "ok"




5xx status code




Error "timeout"




Error "unknown"




Error “booking_form_expired”




Error “rate_not_found”




Error “return_path_required”





Endpoint: https://api.worldota.net/api/b2b/v3/hotel/order/booking/finish/status/ 
ETG API
Partner’s Status on Frontend 
The processing logic on Backend 
Status "ok"




Status "processing"




Error "timeout"




Error "unknown"




5xx status code




Error "block"




Error "charge"




Error "3ds"




Error "soldout"




Error "provider"




Error "book_limit"




Error "not_allowed"




Error "booking_finish_did_not_succeed"





Confirmation e-mails: Please specify what email you will send to ETG in the “user.email” parameter in the “Start booking process”(/order/booking/finish/) request.   
We send the guests' personal email address
We send our corporate email address
We do not  send an email address
Post-Booking 
Retrieve bookings (/order/info): Please specify if you have this endpoint integrated.
Yes
No 
Please specify for what purpose you use this endpoint. 
To confirm the final booking status 
To allow users to get their booking details and check if the requested modifications are in place.


If you use this endpoint, please choose what step you call it.
During booking flow 
After booking flow
Other: indicate the logic


Have you implemented the timegap for this endpoint? 
Yes, here is our time gap: please write the time gap used to call this endpoint 
No 

More integration-related information can be found in the:
ETG v3 documentation;
Integration and Certification Guidelines 
Best Practices for APiv3 
Should any of these points raise questions or concerns, please contact us at apisupport@ratehawk.com. Thank you! 
