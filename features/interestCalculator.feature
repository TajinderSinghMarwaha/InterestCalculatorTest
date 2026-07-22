Feature: Interest Calculator Application
  As a user
  I want to calculate interest with different durations
  So that I can see the total amount after interest

  Background:
    Given the user navigates to the Interest Calculator application
    And the user logs in with valid credentials

  @LOGIN
  Scenario: Successful Login
    Given the user is on the login page
    When the user enters valid credentials and submits the login form
    Then the user should be successfully authenticated
    And the user should be redirected to the Interest Calculator application

  @AC-01
  Scenario: Yearly Interest Calculation
    Given the user enters a Principal Amount of 5000
    And selects Interest rate of "10%"
    And selects Duration "Yearly"
    When the user clicks Calculate
    Then the application computes Interest
    And Total Amount = Principal Amount + Interest
    And both values are rounded to two decimal places
    And both values are displayed

  @AC-02
  Scenario: Monthly Interest Calculation
    Given the user enters a Principal Amount of 5000
    And selects Interest rate of "10%"
    And selects Duration "Monthly"
    When the user clicks Calculate
    Then the application computes Interest
    And Total Amount = Principal Amount + Interest
    And both values are rounded to two decimal places
    And both values are displayed

  @AC-03
  Scenario: Daily Interest Calculation
    Given the user enters a Principal Amount of 5000
    And selects Interest rate of "10%"
    And selects Duration "Daily"
    When the user clicks Calculate
    Then the application computes Interest
    And Total Amount = Principal Amount + Interest
    And both values are rounded to two decimal places
    And both values are displayed

  @AC-04
  Scenario: Correct Rounding to Two Decimals
    Given the user enters a Principal Amount of 1000
    And selects Interest rate of "7%"
    And selects Duration "Daily"
    When the user clicks Calculate
    Then the application computes Interest
    And Interest and Total Amount are rounded (not truncated) to two decimal places using standard rounding rules

  @AC-05
  Scenario: Interest Rate Options Limited to 15 Percent
    Given the user opens the interest rate dropdown
    Then the list contains predefined rates in percentage values from greater than 0 up to and including 15%
    And no option exceeds 15%
    And the calculator accepts 15% as a valid selection

  @AC-06
  Scenario: All Fields Required
    Given the user tries to calculate without completing all mandatory inputs
    When the user clicks Calculate
    Then the calculation is blocked
    And an inline error message is displayed for each missing field

  @AC-07
  Scenario: Principal Amount Validation
    Then slider should allow to select any value upto 15000
    And no option exceeds 15000
    And the calculator accepts 15000 as a valid selection

  @AC-08
  Scenario: Interest Rate Not Selected
    Given the user did not choose an interest rate from the dropdown
    When the user clicks Calculate
    Then show an error
    And prevent calculation

  @AC-09
  Scenario: Duration Not Selected
    Given the user did not choose a duration (Daily/Monthly/Yearly)
    When the user clicks Calculate
    Then show an error
    And prevent calculation

  @AC-10
  Scenario: Consent Required
    Given the consent checkbox is not checked
    When the user clicks Calculate
    Then show an error
    And prevent calculation
