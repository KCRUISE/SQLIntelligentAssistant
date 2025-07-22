import { storage } from './storage';

export async function seedDatabase() {
  try {
    // Create demo user first
    await storage.upsertUser({
      id: "demo-user",
      email: "demo@example.com",
      firstName: "Demo",
      lastName: "User",
      profileImageUrl: null,
    });

    // Create sample schemas
    const ecommerceSchema = await storage.createSchema({
      userId: "demo-user",
      name: "E-commerce Database",
      description: "A typical e-commerce database with users, products, orders, and categories",
      dialect: "postgresql",
      schemaData: {
        tables: {
          users: {
            columns: {
              id: { type: "SERIAL", primaryKey: true },
              email: { type: "VARCHAR(255)", unique: true, notNull: true },
              first_name: { type: "VARCHAR(100)", notNull: true },
              last_name: { type: "VARCHAR(100)", notNull: true },
              created_at: { type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" },
              updated_at: { type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" }
            }
          },
          categories: {
            columns: {
              id: { type: "SERIAL", primaryKey: true },
              name: { type: "VARCHAR(100)", notNull: true },
              description: { type: "TEXT" },
              created_at: { type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" }
            }
          },
          products: {
            columns: {
              id: { type: "SERIAL", primaryKey: true },
              name: { type: "VARCHAR(255)", notNull: true },
              description: { type: "TEXT" },
              price: { type: "DECIMAL(10,2)", notNull: true },
              category_id: { type: "INTEGER", foreignKey: "categories.id" },
              stock_quantity: { type: "INTEGER", default: 0 },
              created_at: { type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" }
            }
          },
          orders: {
            columns: {
              id: { type: "SERIAL", primaryKey: true },
              user_id: { type: "INTEGER", foreignKey: "users.id", notNull: true },
              total_amount: { type: "DECIMAL(10,2)", notNull: true },
              status: { type: "VARCHAR(50)", default: "pending" },
              created_at: { type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" }
            }
          },
          order_items: {
            columns: {
              id: { type: "SERIAL", primaryKey: true },
              order_id: { type: "INTEGER", foreignKey: "orders.id", notNull: true },
              product_id: { type: "INTEGER", foreignKey: "products.id", notNull: true },
              quantity: { type: "INTEGER", notNull: true },
              price: { type: "DECIMAL(10,2)", notNull: true }
            }
          }
        }
      }
    });

    const blogSchema = await storage.createSchema({
      userId: "demo-user",
      name: "Blog Database",
      description: "A blog database with posts, comments, and tags",
      dialect: "mysql",
      schemaData: {
        tables: {
          authors: {
            columns: {
              id: { type: "INT AUTO_INCREMENT", primaryKey: true },
              username: { type: "VARCHAR(50)", unique: true, notNull: true },
              email: { type: "VARCHAR(255)", unique: true, notNull: true },
              bio: { type: "TEXT" },
              created_at: { type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" }
            }
          },
          posts: {
            columns: {
              id: { type: "INT AUTO_INCREMENT", primaryKey: true },
              title: { type: "VARCHAR(255)", notNull: true },
              content: { type: "LONGTEXT", notNull: true },
              author_id: { type: "INT", foreignKey: "authors.id", notNull: true },
              status: { type: "ENUM('draft', 'published', 'archived')", default: "draft" },
              published_at: { type: "TIMESTAMP", nullable: true },
              created_at: { type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" }
            }
          },
          comments: {
            columns: {
              id: { type: "INT AUTO_INCREMENT", primaryKey: true },
              post_id: { type: "INT", foreignKey: "posts.id", notNull: true },
              author_name: { type: "VARCHAR(100)", notNull: true },
              author_email: { type: "VARCHAR(255)", notNull: true },
              content: { type: "TEXT", notNull: true },
              created_at: { type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" }
            }
          },
          tags: {
            columns: {
              id: { type: "INT AUTO_INCREMENT", primaryKey: true },
              name: { type: "VARCHAR(50)", unique: true, notNull: true },
              created_at: { type: "TIMESTAMP", default: "CURRENT_TIMESTAMP" }
            }
          },
          post_tags: {
            columns: {
              post_id: { type: "INT", foreignKey: "posts.id", notNull: true },
              tag_id: { type: "INT", foreignKey: "tags.id", notNull: true }
            }
          }
        }
      }
    });

    // Create some sample queries
    const queries = [
      {
        userId: "demo-user",
        naturalLanguage: "Show me all customers who have placed orders in the last 30 days",
        sqlQuery: `SELECT DISTINCT u.id, u.first_name, u.last_name, u.email, COUNT(o.id) as order_count
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.first_name, u.last_name, u.email
ORDER BY order_count DESC;`,
        dialect: "postgresql",
        explanation: "This query finds all customers who have placed orders in the last 30 days, showing their details and order count, sorted by most active customers first.",
        isFavorite: true,
      },
      {
        userId: "demo-user",
        naturalLanguage: "Find the top 5 selling products by revenue",
        sqlQuery: `SELECT p.name, p.price, SUM(oi.quantity * oi.price) as total_revenue, SUM(oi.quantity) as total_sold
FROM products p
JOIN order_items oi ON p.id = oi.product_id
JOIN orders o ON oi.order_id = o.id
WHERE o.status = 'completed'
GROUP BY p.id, p.name, p.price
ORDER BY total_revenue DESC
LIMIT 5;`,
        dialect: "postgresql",
        explanation: "This query calculates the total revenue and quantity sold for each product, then returns the top 5 products by revenue.",
        isFavorite: false,
      },
      {
        userId: "demo-user",
        naturalLanguage: "Get all blog posts published in the last month with their author details",
        sqlQuery: `SELECT p.title, p.content, p.published_at, a.username, a.email
FROM posts p
JOIN authors a ON p.author_id = a.id
WHERE p.status = 'published'
  AND p.published_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
ORDER BY p.published_at DESC;`,
        dialect: "mysql",
        explanation: "This query retrieves all published blog posts from the last month along with their author information, sorted by publication date.",
        isFavorite: true,
      }
    ];

    // Create sample queries
    for (const query of queries) {
      await storage.createQuery(query);
    }

    console.log('Database seeded successfully!');
    console.log(`Created ${2} sample schemas and ${queries.length} sample queries`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}