<?php
/*
|--------------------------------------------------------------------------
| Applicant Module Routes
|--------------------------------------------------------------------------
*/

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;


// start
Route::get('/', 'ApplicantAuthController@index')->name('start');

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/

Route::get('login', 'ApplicantAuthController@loginGet')->name('login_get');

Route::post('login', 'ApplicantAuthController@login')->name('login_post');

Route::post('create', 'ApplicantAuthController@create')->name('create');

Route::get('logout', 'ApplicantAuthController@logout');


/*
|--------------------------------------------------------------------------
| Programme and Remita Routes
|--------------------------------------------------------------------------
*/
// receive applicant programme details and generate RRR (step 1)
Route::get('programme', 'ApplicantProgrammeController@programmeGet')->name('programme');

Route::post('programme', 'ApplicantProgrammeController@programmePost');

// pay via remita (step 2)
Route::get('payments/{type?}', 'ApplicantPaymentController@pay')->name('pay');

// process remita response
Route::get('remita-response/{type?}', 'ApplicantPaymentController@remitaResponse');

// verify RRR (step 3)
Route::get('verify/{type?}', 'ApplicantPaymentController@verifyGet')->name('verify');

Route::post('verify', 'ApplicantPaymentController@verifyPost');

Route::get('verified/{type?}', 'ApplicantPaymentController@verified');

Route::get('invoice/{type?}', 'ApplicantPaymentController@getInvoice');

Route::get('invoice/download/{type?}', 'ApplicantPaymentController@getInvoice');

Route::get('receipt/{type?}', 'ApplicantPaymentController@getReceipt');

Route::get('receipt/download/{type?}', 'ApplicantPaymentController@getReceipt');

/*
|--------------------------------------------------------------------------
| Personal Info Routes
|--------------------------------------------------------------------------
*/
Route::get('personal-information', 'ApplicantBioDataController@getPersonalInfo')->name('biodata');

Route::post('personal-information', 'ApplicantBioDataController@postPersonalInfo');

/*
|--------------------------------------------------------------------------
| Educational Certificates Routes
|--------------------------------------------------------------------------
*/
Route::get('certificate/{type?}', 'ApplicantCertificateController@getEducationalInfo')->name('certificate');

Route::post('certificate/{cert}', 'ApplicantCertificateController@handleExam');

/*
|--------------------------------------------------------------------------
| Work Experience Routes
|--------------------------------------------------------------------------
*/
Route::get('experience', 'ApplicantExperienceController@getExperience')->name('experience');

Route::post('experience', 'ApplicantExperienceController@postExperience');
/*
|--------------------------------------------------------------------------
| Uploads Routes
|--------------------------------------------------------------------------
*/
Route::get('uploads', 'ApplicantUploadsController@index')->name('uploads');

Route::post('uploads/save/{type}', 'ApplicantUploadsController@save');

Route::get('uploads/view/{id}', 'ApplicantUploadsController@viewFile');

Route::delete('uploads/delete/{id}', 'ApplicantUploadsController@deleteFile');

Route::get('uploads/continue', 'ApplicantUploadsController@continue');

/*
|--------------------------------------------------------------------------
| Completion Routes
|--------------------------------------------------------------------------
*/
Route::get('review', 'ApplicantReviewController@getReview')->name('review');

Route::post('review', 'ApplicantReviewController@postReview');

Route::get('review/print', 'ApplicantReviewController@printApplicationForm');

/*
|--------------------------------------------------------------------------
| Dashboard Routes
|--------------------------------------------------------------------------
*/
Route::get('dashboard', 'ApplicantDashboardController@getDashboard')->name('dashboard');

Route::get('dashboard/admission/print', 'ApplicantDashboardController@printAdmissionForm');

Route::get('dashboard/receipts', 'ApplicantDashboardController@getReceipts');

Route::get('fakelogin', function(){
      Auth::loginUsingId(3);
      return redirect()->route('biodata');
});

Route::get('/test', function(){

      $bool = \NTI\Repository\Services\NTI::getFeeDefinition(2, 1, 0, 0, 1, 'fresh');
       dd($bool);
//$q = \NTI\Repository\Services\NTI::getFeeDefinition(19, 1, 4, 1, 1, 'fresh');
//dd($q);
});

Route::get('testfee/{type}/{programme_id}', 'ApplicantPaymentController@testParams');