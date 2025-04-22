function getBathValue() {
  var uiBathrooms = document.getElementsByName("uiBathrooms");
  for(var i in uiBathrooms) {
      if(uiBathrooms[i].checked) {
          return parseInt(i)+1;
      }
  }
  return -1; 
}

function getBHKValue() {
  var uiBHK = document.getElementsByName("uiBHK");
  for(var i in uiBHK) {
      if(uiBHK[i].checked) {
          return parseInt(i)+1;
      }
  }
  return -1; 
}

function onClickedEstimatePrice() {
  console.log("Estimate price button clicked");
  var sqft = document.getElementById("uiSqft");
  var bhk = getBHKValue();
  var bathrooms = getBathValue();
  var location = document.getElementById("uiLocations");
  var estPrice = document.getElementById("uiEstimatedPrice");

  if (sqft.value <= 0 || bhk === -1 || bathrooms === -1 || !location.value) {
      estPrice.innerHTML = "<h2>Please fill all fields correctly</h2>";
      return;
  }

  var url = "http://127.0.0.1:5000/predict"; 

  $.post(url, {
      total_sqft: parseFloat(sqft.value),
      bhk: bhk,
      bath: bathrooms,
      location: location.value
  }, function(data, status) {
      if (status === "success" && data.estimated_price !== undefined) {
          estPrice.innerHTML = "<h2>" + data.estimated_price.toString() + " Lakh</h2>";
          console.log("Predicted Price:", data.estimated_price);
      } else {
          estPrice.innerHTML = "<h2>Error: " + (data.error || "Prediction failed") + "</h2>";
          console.log("Error:", data.error || "No estimated_price in response");
      }
  }).fail(function(jqXHR, textStatus, errorThrown) {
      estPrice.innerHTML = "<h2>Error: Server request failed</h2>";
      console.log("Request failed:", textStatus, errorThrown);
  });
}

function onPageLoad() {
  console.log("Document loaded");
  var url = "http://127.0.0.1:5000/get_location";
  $.get(url, function(data, status) {
      console.log("Got response for location_names request");
      if (data && data.locations) {
          var locations = data.locations;
          var uiLocations = document.getElementById("uiLocations");
          $('#uiLocations').empty();
          $('#uiLocations').append(new Option("Choose a Location", "", true, true));
          for (var i in locations) {
              var opt = new Option(locations[i]);
              $('#uiLocations').append(opt);
          }
      } else {
          console.log("Error loading locations:", data.error || "No locations in response");
      }
  }).fail(function(jqXHR, textStatus, errorThrown) {
      console.log("Location request failed:", textStatus, errorThrown);
  });
}

window.onload = onPageLoad;