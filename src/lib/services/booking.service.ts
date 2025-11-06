// src/lib/services/booking.service.ts
import { prisma } from "@/lib/prisma";
import { BookingStatus } from "@/types/prisma";

export const bookingService = {
  // Get all bookings with related data
  getAll: async () => {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true
                }
              }
            }
          },
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              channelName: true
            }
          },
          blocking: {
            select: {
              id: true,
              description: true,
              isBlocking: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        data: bookings,
        message: "Get all bookings successful",
      };
    } catch (error) {
      console.error("Get all bookings error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Get all bookings failed",
      };
    }
  },

  // Get bookings by user
  getByUser: async (userId: string) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          userId
        },
        include: {
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              channelName: true
            }
          },
          blocking: {
            select: {
              id: true,
              description: true,
              isBlocking: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        data: bookings,
        message: "Get user bookings successful",
      };
    } catch (error) {
      console.error("Get user bookings error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Get user bookings failed",
      };
    }
  },

  // Get bookings by court
  getByCourt: async (courtId: string) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          courtId
        },
        include: {
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              channelName: true
            }
          },
          blocking: {
            select: {
              id: true,
              description: true,
              isBlocking: true
            }
          }
        },
        orderBy: {
          bookingDate: 'asc'
        }
      });

      return {
        success: true,
        data: bookings,
        message: "Get court bookings successful",
      };
    } catch (error) {
      console.error("Get court bookings error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Get court bookings failed",
      };
    }
  },

  // Get bookings by status
  getByStatus: async (status: BookingStatus) => {
    try {
      const bookings = await prisma.booking.findMany({
        where: {
          status
        },
        include: {
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true
                }
              }
            }
          },
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              status: true,
              paymentDate: true,
              channelName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return {
        success: true,
        data: bookings,
        message: `Get ${status.toLowerCase()} bookings successful`,
      };
    } catch (error) {
      console.error(`Get ${status.toLowerCase()} bookings error:`, error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : `Get ${status.toLowerCase()} bookings failed`,
      };
    }
  },

  // Get booking by ID
  getById: async (id: string) => {
    try {
      const booking = await prisma.booking.findUnique({
        where: {
          id
        },
        include: {
          court: {
            include: {
              venue: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  city: true,
                  address: true,
                  phone: true
                }
              }
            }
          },
          user: {
            include: {
              profile: {
                select: {
                  fullName: true,
                  avatar: true
                }
              }
            }
          },
          payments: true,
          blocking: {
            select: {
              id: true,
              description: true,
              isBlocking: true,
              createdAt: true,
              updatedAt: true
            }
          }
        }
      });

      if (!booking) {
        return {
          success: false,
          data: null,
          message: "Booking not found",
        };
      }

      return {
        success: true,
        data: booking,
        message: "Get booking successful",
      };
    } catch (error) {
      console.error("Get booking error:", error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : "Get booking failed",
      };
    }
  }
};
