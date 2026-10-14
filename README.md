# Smart Home Security and Intruder Detection System Using Combinational Logic

## Project Description

The Smart Home Security and Intruder Detection System is a digital logic project designed to detect potential intrusions using binary inputs and combinational logic gates. The system monitors door status, window status, motion detection, and authorized access to determine whether an alarm should be activated.

The circuit is designed and simulated using Logisim Evolution.

## Objectives

- Understand the application of digital logic in security systems.
- Design a combinational logic circuit using basic logic gates.
- Implement and verify a Boolean expression.
- Simulate intrusion detection using different binary input combinations.

## Required Components

- Logisim Evolution software
- Four input pins or switches
- OR gates
- AND gate
- NOT gate
- Red LED as the alarm indicator
- Connecting wires

## Input and Output Description

| Symbol | Description |
|---|---|
| D | Door open |
| W | Window open |
| M | Motion detected |
| P | Authorized access |
| A | Alarm output |

A value of `1` represents an active input, while `0` represents an inactive input.

## Boolean Expression

**A = ((D OR W) AND (NOT P)) OR M**

The alarm activates when motion is detected, or when the door or window is open without authorization.

## Working Principle

1. The door and window inputs are combined using an OR gate.
2. The authorized-access input is inverted using a NOT gate.
3. An AND gate combines the door/window result with the inverted authorization signal.
4. A final OR gate combines this result with the motion input.
5. The final output controls the red LED, indicating the alarm status.

## Circuit Diagram

The circuit diagram is available in the `circuit/` directory.

## Simulation

The circuit can be opened and simulated using Logisim Evolution. Input switches can be changed to test different conditions.

Expected behavior:
- No active intrusion inputs: alarm OFF.
- Motion detected: alarm ON.
- Door or window open without authorization: alarm ON.
- Door or window open with authorization and no motion: alarm OFF.

## Setup Instructions

1. Install Logisim Evolution.
2. Clone or download this repository.
3. Open the `.circ` file in the `circuit/` directory.
4. Select the input switches and change their values.
5. Observe the red LED to verify the alarm output.
6. Compare the results with the Boolean expression and truth table.

## Applications

- Residential security systems
- Door and window intrusion detection
- Motion-based security monitoring
- Educational demonstrations of digital logic

## Advantages

- Simple and cost-effective design
- Fast combinational logic response
- Easy to simulate and verify
- Can be extended with additional security features

## Limitations

- Does not store previous intrusion events.
- Does not provide remote notifications.
- Uses simulated inputs rather than physical sensors.
- Incorrect sensor inputs may cause false alarms.

## Future Scope

- Integration with physical sensors and a microcontroller
- Audible alarm using a buzzer
- Mobile notifications
- Event storage using memory circuits
- Enhanced access control

## Conclusion

This project demonstrates how combinational logic gates can be used to implement a basic smart home security system. The design provides a foundation for more advanced security applications.

## Project Files

- `circuit/` — Logisim circuit and circuit diagram
- `simulation/` — Simulation screenshots and results
- `report/` — Project report
- `presentation/` — Presentation slides
- `poster/` — Project poster
- `src/` — Additional source files, if applicable

## Tools Used

- Logisim Evolution
- GitHub

## Author
2620030473 - S. Likhita
2620030502 - A. Akshara
2620040079 - T. Divya
