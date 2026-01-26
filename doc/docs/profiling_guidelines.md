# Guidelines for battery profiling

!!! note "Note"
     Battery profiling is available for the nPM1300 EK and the nPM1304 EK.

The guidelines in this section optimize the use of the nPM PowerUP app for [battery profiling](profiling_battery.md).

- Before starting battery profiling, refer to the battery datasheet and ensure that the parameters are set correctly. This includes specification of the battery capacity, termination voltages, and any other relevant parameters provided in the datasheet.
- Ensure a solid, low-resistance battery connection to the EK. Make sure to use stable connectors. Poor contacts can cause profiling or model errors (or both).

    !!! info "Tip"
        For batteries without leads (pads only, for example smart-ring batteries), solder them directly to the nPM1304 EK Battery pads. For more information, see the [Power supply](https://docs.nordicsemi.com/bundle/ug_npm1304_ek/page/UG/nPM1304_EK/power_supply.html) chapter in the nPM1304 EK hardware user guide.

- Due to the increased non-linearities of batteries operating at temperatures below zero degrees Celsius, it is recommended to conduct battery profiling exclusively above zero degrees. Avoid profiling at temperatures below freezing or in extreme heat conditions.

    !!! note "Note"
        Even if the battery is profiled at temperatures above zero Celsius, the fuel gauge can still perform reliably below zero within the standard discharge conditions of the battery.

- To account for temperature variations and improve the accuracy of state-of-charge estimations, profile the battery at three different test temperatures. For example, if the operating temperature of the device ranges from -15°C to 45°C, you can profile the battery at 5°C, 25°C, and 45°C. The final battery model will be created by combining the individual temperature profiles.

    !!! note "Note"
        You can also profile the battery at each temperature separately and then use the nPM PowerUP [**Profiles**](./overview.md#npm1300-and-npm1304-profiles-tab) tab to merge the individual models into a single multi-temperature model. For details, see [Working with profiles](working_with_profiles.md).

- The time to profile the battery takes approximately 48 hours per temperature, but can be longer for higher capacity batteries. Do not modify the device configuration during the profiling process as this causes the profiling to abort.
- Ensure that your computer does not go into sleep mode or hibernate during the profiling process.
- To avoid issues with computer restarting due to system updates, the computer can be put in flight mode during profiling.
- If necessary, you can choose to profile the battery at a single operating temperature. However, this method will not account for temperature effects during fuel gauging, which may result in reduced accuracy.
- Ensure that the battery test temperature stays constant throughout the profiling period, as fluctuations in temperature can affect the accuracy of the battery model. Use a temperature chamber to improve performance.
- The use of a battery with a Negative Temperature Coefficient (NTC) thermistor is recommended. Specify test temperatures for the profiling process for both type of batteries (with or without NTC).

    - If the battery NTC sensor is available, the battery temperature from the NTC measurement will be used for creating the battery model.
    - If the NTC sensor is not available, the specified test temperatures will be used for creating the battery model.
    - For NTC selection, refer to [Battery temperature monitoring](https://docs.nordicsemi.com/bundle/ps_npm1300/page/chapters/charger.html#ariaid-title5) in the PMIC device datasheet.

- The battery must be fully charged before profiling at a new temperature. Follow the instructions in the application to charge the battery at room temperature to ensure consistent and reliable results during the profiling process.
- The [fuel gauge algorithm](https://docs.nordicsemi.com/bundle/nan_045/page/APP/nan_045/npm1300_fuel_gauge.html) incorporates internal adjustments to correct any initialization errors resulting from an unrested battery and unexpected reset conditions. These errors typically have a minor impact, and the predictions will converge to the accurate value within a few minutes of normal operation.

For more information, or if you have any technical questions before, during, or after your development, contact our Technical Support team at [DevZone](https://devzone.nordicsemi.com/).
