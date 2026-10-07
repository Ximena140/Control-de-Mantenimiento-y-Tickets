# Maintenance Ticket Management System

Maintenance Ticket Management System is a web application developed to digitalize maintenance incident reports for equipment and physical infrastructure.

The application allows users to create maintenance tickets and allows an operator to manage their progress through a defined workflow.

The main objective of the project is to implement a ticket workflow using a state machine, maintain data integrity, and keep a history of the events associated with each ticket.

---

## Business Context

The business needs to digitalize maintenance reports for assets such as ATMs, equipment, or physical infrastructure.

A user reports an incident by creating a ticket. The ticket is then managed through the following workflow:

```text
PENDING → IN_PROGRESS → RESOLVED 
