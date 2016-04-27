// This function is just used to display error messages on the page.
// Assumes there's an element with an ID of "payment-errors".
function reportError(msg) {
	// Show the error in the form:
	$('#payment-errors').text(msg).addClass('error');
	// re-enable the submit button:
	$('#submitBtn').prop('disabled', false);
	return false;
}

// Assumes jQuery is loaded!
// Watch for the document to be ready:
$(document).ready(function() {
	
	// Watch for a form submission:
	$("#payment-form").submit(function(event) {
		// remove any old other errors
		$("div.other-errors").remove();
		// Flag variable:
		var error = false;
		
		// disable the submit button to prevent repeated clicks:
		$('#submitBtn').attr("disabled", "disabled");

		// Get the values:
var	zipcode = $('#zipcode').val(),
 	ccNum = $('#card-number').val(),
    cvcNum = $('#security-code').val(),
    expMonth = $('#expiration-month').val(),
    expYear = $('#expiration-year').val();

		
		// Validate the number:
		if (!Stripe.validateCardNumber(ccNum)) {
			error = true;
			$('#card-number').before('<div class="other-errors">The credit card number appears to be invalid</div>');
			reportError('See Problem Above');
		}

		// Validate the CVC:
		if (!Stripe.validateCVC(cvcNum)) {
			error = true;
			$('#security-code').before('<div class="other-errors">The CVC number appears to be invalid</div>');
			reportError('See Problem Above');
		}
		
		// Validate the expiration:
		if (!Stripe.validateExpiry(expMonth, expYear)) {
			error = true;
			$('#expiration-month').before('<div class="other-errors">The expiration date appears to be invalid</div>');
			reportError('See Problem Above');
		}

		var notChecked = (!$('#accept_terms').is(':checked'));
		//alert(notChecked);
		if(notChecked) {
			$('.checktext').before('<div class="other-errors">Must check accept terms</div>');
			error = true;
			reportError('See Problem above.');
		}
		$('#payment-form input[id = notblank]').each(function() {
			if ($(this).val()==='') {
				$(this).before('<div class="other-errors">This can\'t be blank</div>');
				error = true;
				reportError('See Problem above');
			}
		}); // go through each required value
		
		// this is for state drop down menu
		if ($("#state").val() == '') {
		$('#state').before('<div class="other-errors">Please select a State</div>');
			error = true; 
			reportError('See Problem above'); 
		}
		
		 // this is for country drop down menu
		if ($("#country").val() == '') {
		$('#country').before('<div class="other-errors">Please select a country</div>');
			error = true; 
			reportError('See Problem above'); 
		}
		// Validate other form elements, if needed!
		//zipcode = true;
		// Check for errors:
		if (!error) {
			
			// Get the Stripe token:
			Stripe.createToken({
				number: ccNum,
				address_zip: zipcode,
				cvc: cvcNum,
				exp_month: expMonth,
				exp_year: expYear
			}, stripeResponseHandler);

		}

		// Prevent the form from submitting:
		return false;

	}); // Form submission
	
}); // Document ready.

// Function handles the Stripe response:
function stripeResponseHandler(status, response) {
	
	// Check for an error:
	if (response.error) {

		reportError(response.error.message);
		
	} else { // No errors, submit the form:

	  var f = $("#payment-form");

	  // Token contains id, last4, and card type:
	  var token = response['id'];
	
	  // Insert the token into the form so it gets submitted to the server
	  f.append("<input type='hidden' name='stripeToken' value='" + token + "' />");
	
	  // Submit the form:
	  f.get(0).submit();

	}
	
} // End of stripeResponseHandler() function.
