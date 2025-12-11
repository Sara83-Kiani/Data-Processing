/**
 * Base Entity class with common functionality
 * All entities should extend this for consistent behavior
 */
export abstract class BaseEntity {
  /**
   * Convert entity to plain object for API responses
   */
  public toJSON(): Record<string, any> {
    return { ...this };
  }

  /**
   * Convert entity to XML-friendly format
   */
  public toXML(): Record<string, any> {
    return this.toJSON();
  }

  /**
   * Validate entity data
   * Override in child classes for custom validation
   */
  public abstract validate(): boolean;
}
