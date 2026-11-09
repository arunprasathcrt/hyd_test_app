import { z } from 'zod';

export const presentationCustomersResponseSchema = z.object({
  companies: z.object({
    nodes: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        mainContact: z
        .object({
          customer: z
            .object({
              firstName: z.string().nullable(),
              lastName: z.string().nullable(),
            })
            .nullable(),
        })
        .nullable(),
        segment: z
          .object({
            value: z.string().nullable(),
          })
          .nullable()
          .optional(),
        tier: z
          .object({
            value: z.string().nullable(),
          })
          .nullable()
          .optional(),
        customerCode: z
          .object({
            value: z.string().nullable(),
          })
          .nullable()
          .optional(),
        repName: z
          .object({
            value: z.string().nullable(),
          })
          .nullable()
          .optional(),
      }),
    ),
  }),
});