using Inficom.Mvc5.Services;
using Moq;
using System;
using System.Diagnostics.CodeAnalysis;
using Xunit;

namespace Inficom.UnitTest
{
    [ExcludeFromCodeCoverage]
    public class CalculatorTest
    {
        [Fact]
        public void GetFullName_InvalidArguments_ThrowsArgumentException()
        {
            Assert.Throws<ArgumentException>(() => Calculator.GetFullName("", ""));
            Assert.Throws<ArgumentException>(() => Calculator.GetFullName("Mary", ""));
        }

        [Fact]
        public void GetFullName_ValidInputs_ReturnsCorrectResult_Example1()
        {
            string fullNameResult = Calculator.GetFullName(" Mohamed ", " Adardour   ");
            Assert.Equal("Mohamed Adardour", fullNameResult);
        }

        [Theory]
        [InlineData(" Maryx", "  Jane  ", "Mary Jane")]
        [InlineData(" Bob", "Marley", "Bob Marley")]
        [InlineData(" Joe Hanson", " Lee   ", "Joe Hanson Lee")]
        public void GetFullName_ValidInputs_ReturnsCorrectResult_Example2(string firstName, string lastName, string expectedFullName)
        {
            string fullNameResult = Calculator.GetFullName(firstName, lastName);

            Assert.Equal(expectedFullName, fullNameResult);
        }

        public void AddTest()
        {
            var calculator = new FakeCalculator();
            Assert.Equal(5, calculator.Add(2, 3));
        }

        public void MultiplyTest()
        {
            var calculator = new FakeCalculator();
            Assert.Equal(6, calculator.Multiply(2, 3));
        }

        public void PassingTest()
        {
            //var calculator = new ICalculator();  
            //Assert.Equal(4, calculator.Add(2, 2));  

            var calculator = new Mock<ICalculator>();
            calculator.Setup(x => x.Add(2, 2)).Returns(4);
            Assert.Equal(4, calculator.Object.Add(2, 2));
        }
    }

    public class FakeCalculator : ICalculator
    {
        public decimal Add(decimal num1, decimal num2)
        {
            return num1 + num2;
        }

        public decimal Divide(decimal num1, decimal num2)
        {
            throw new NotImplementedException();
        }

        public virtual decimal Multiply(decimal num1, decimal num2)
        {
            throw new NotImplementedException();
        }

        public decimal Substract(decimal num1, decimal num2)
        {
            throw new NotImplementedException();
        }
    }
}
