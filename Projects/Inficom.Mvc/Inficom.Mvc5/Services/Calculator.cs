using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Inficom.Mvc5.Services
{
    public class Calculator : ICalculator
    {
        public static string GetFullName(string firstName, string lastName)
        {
            if (string.IsNullOrWhiteSpace(firstName))
            {
                throw new ArgumentException("First name must be provided.");
            }
            if (string.IsNullOrWhiteSpace(lastName))
            {
                throw new ArgumentException("Last name must be provided.");
            }            

            return $"{firstName.Trim()} {lastName.Trim()}".Trim();
        }

        public decimal Add(decimal num1, decimal num2)
        {
            throw new NotImplementedException();
        }

        public decimal Divide(decimal num1, decimal num2)
        {
            throw new NotImplementedException();
        }

        public decimal Multiply(decimal num1, decimal num2)
        {
            throw new NotImplementedException();
        }

        public decimal Substract(decimal num1, decimal num2)
        {
            throw new NotImplementedException();
        }        
    }
}