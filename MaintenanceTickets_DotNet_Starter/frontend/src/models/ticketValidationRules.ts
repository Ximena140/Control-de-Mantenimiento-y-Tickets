/** Length limits of CreateTicketDto, as published in the API's Swagger. */
export const CREATE_TICKET_LIMITS = {
  titleMinLength: 3,
  titleMaxLength: 150,
  assetCodeMaxLength: 30,
  descriptionMaxLength: 2000,
  reportedByMaxLength: 100,
} as const;
